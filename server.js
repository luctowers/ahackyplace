const http = require("http");
const WebSocket = require("ws");

const app = require("./app");
const config = require("./config");
const canvas = require("./lib/canvas");

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

canvas.on("newpixel", function(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN)
      client.send(data);
  });
});

server.listen(config.port, () => {
  console.log(`Listening on port ${config.port}...`);
});
