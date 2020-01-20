const canvas = require("../lib/canvas");
const memoryHelper = require("../lib/memory-helper");

var cachedCanvas;
var cachedCanvasTimestamp;
const cachedCanvasTTL = 250; // 0.25 seconds

module.exports = async function (request, response) {

  const canvasInfo = await canvas.info();

  var canvasData;
  const now = new Date();
  if (!cachedCanvas || now - cachedCanvasTimestamp > cachedCanvasTTL) {
    canvasData = await canvas.data();
    cachedCanvas = canvasData;
    cachedCanvasTimestamp = now;
  }
  else
    canvasData = cachedCanvas;
  
  response.writeHead(200, {"Content-Type": "application/octet-stream"});
  response.write(memoryHelper.int32ArrayToBuffer([canvasInfo.width, canvasInfo.height, canvasInfo.bitdepth]));
  response.end(canvasData);

};
