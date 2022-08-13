const PassProxy = require('./libs/passedWS/index.js');
const { WebSocketServer } = require("ws"),
      net = require("net");

const options = require('./options.json');

const wss = new WebSocketServer({ port: options.unPassedPort });

async function main() {
  console.log("Connecting proxies...");
  console.log("- stage0: connecting to proxy");

  wss.on("connection", async function (ws) {
    ws.isReady = false;

    const server = new net.Socket();

    server.connect(options.server.port, options.server.ip, function() {
      ws.isReady = true;
      ws.send("Passy: Connected");
    });

    server.on("data", function (data) {
      if (ws.isReady) ws.send(data);
    });

    ws.on("message", function(data) {
      if (ws.isReady) server.write(data);
    })
  })
  const proxy = new PassProxy({
    passwords: options.passwords,
    proxy: 'ws://localhost:' + options.unPassedPort,
    port: options.passedPort
  });

  console.log("- stage0: ready\n- stage1: connecting to proxy");
  await proxy.init();
}

main();