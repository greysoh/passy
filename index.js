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

    let opts = this.options;

    opts.port = opts.passedPort;
    opts.proxy = "ws://localhost:" + opts.originalPort;

    delete opts.originalPort;
    delete opts.passedPort;

    const proxy = new PassProxy(opts);

    await proxy.init();
  }
}

module.exports = PassyServer;