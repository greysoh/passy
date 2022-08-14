const PassyServer = require("../../index.js");
const options = require("../../options.json");

async function main() {
  const proxy = new PassyServer(options);
  await proxy.main();
}

main();