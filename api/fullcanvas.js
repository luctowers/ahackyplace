const canvas = require("../lib/canvas");
const memoryHelper = require("../lib/memory-helper");

module.exports = async function (request, response) {

  const canvasInfo = await canvas.info();
  const canvasData = await canvas.data();
  
  response.writeHead(200, {"Content-Type": "application/octet-stream"});
  response.write(memoryHelper.int32ArrayToBuffer([canvasInfo.width, canvasInfo.height]));
  response.end(canvasData);

};
