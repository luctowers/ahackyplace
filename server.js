const http = require("http");
const WebSocket = require("ws");

const app = require("./app");
const config = require("./config");
const canvas = require("./lib/canvas");
const WindowBatch = require("./lib/window-batch");

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

// send new pixels to client in batches, one btach repressents all new pixels in a 100ms timeframe
var newPixelBatch = new WindowBatch(100, (batch) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN)
      client.send(Buffer.concat(batch));
  });
});
canvas.on("newpixel", (data) => {
  newPixelBatch.push(data); 
});

server.listen(config.port, () => {
  console.log(`Listening on port ${config.port}...`);
});
