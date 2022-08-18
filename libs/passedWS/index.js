const { WebSocketServer, WebSocket } = require("ws");
const Server = require("@creamy-dev/libincenerator");

module.exports = class Pass {
  constructor(options) {
    if (typeof options != "object") {
      throw new Error("PassedWS: options must be an object");
    }

    if (!options.passwords) {
      throw new Error("PassedWS: passwords must be an array");
    }

    if (!options.proxy) {
      throw new Error("PassedWS: proxy URL must be a string");
    }

    this.options = options;
    this.options.port = !this.options.port ? 8080 : this.options.port;
  }

  async init() {
    const options = this.options;

    this.proxy = this.options.isIncenerator ? new Server(this.options.inceneratorOptions) : new WebSocketServer({ port: this.options.port });

    this.proxy.on("connection", async function (ws) {
      ws.connectState = false;

      ws.on("message", async function (binaryData) {
        const data = binaryData.toString();

        if (!ws.connectState) {
          if (!data.startsWith("Accept: ")) {
            ws.send("400 Bad Request");
            return;
          }

          const type = data.split(":")[1].trim();

          if (type == "IsPassedWS") {
            ws.send("AcceptResponse IsPassedWS: true");
          } else if (type.startsWith("Bearer")) {
            const token = type.split("Bearer")[1].trim();
            const isValid = options.passwords.includes(token);

            if (isValid) {
              ws.connectState = true;
              ws.send("AcceptResponse Bearer: true");
            } else {
              ws.send("AcceptResponse Bearer: false");
              return;
            }

            ws.send("InitProxy: Attempting to connect");

            ws.proxy = new WebSocket(options.proxy);

            ws.proxy.on("open", function () {
              ws.send("InitProxy: Connected");
              ws.readyProxy = true;

              ws.proxy.on("message", function (recvData) {
                if (ws.connectState) ws.send(recvData);
              });
            });
          }
        } else {
          while (!ws.readyProxy) {
            //
          }

          ws.proxy.send(binaryData);
        }
      });
    });
  }
}
