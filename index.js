const PassProxy = require("./libs/passedWS/index.js");
const { WebSocketServer } = require("ws"),
  net = require("net");

class PassyServer {
  constructor(options) {
    this.options = options;
  }

  async main() {
    const options = this.options;
    const wss = new WebSocketServer({ port: options.originalPort });

    wss.on("connection", async function (ws) {
      ws.isReady = false;

      const server = new net.Socket();

      server.connect(options.server.port, options.server.ip, function () {
        ws.isReady = true;
        ws.send("Passy: Connected");
      });

      server.on("data", function (data) {
        if (ws.isReady) ws.send(data);
      });

      ws.on("message", function (data) {
        if (ws.isReady) server.write(data);
      });
    });

    const proxy = new PassProxy({
      passwords: options.passwords,
      proxy: "ws://localhost:" + options.originalPort,
      port: options.passedPort,
    });

    await proxy.init();
  }
}

module.exports = PassyServer;