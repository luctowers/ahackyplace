const redis = require("./redis");

var canvasInfoPromise = redis.multi()
  .get("canvas_width")
  .get("canvas_height")
  .get("canvas_bitdepth")
  .execAsync()
  .then((replies) => {
    const canvasInfo = {};
    if (!(canvasInfo.width = parseInt(replies[0], 10)))
      throw new Error("unable to determine canvas width");
    else if (!(canvasInfo.height = parseInt(replies[1], 10)))
      throw new Error("unable to determine canvas height");
    else if (!(canvasInfo.bitdepth = parseInt(replies[2], 10)))
      throw new Error("unable to determine canvas bitdepth");
    else
      return canvasInfo;
  });

const canvas = {};

canvas.info = function() {
  return canvasInfoPromise;
};

canvas.setPixel = function(x, y, value) {

  return canvasInfoPromise.then((canvasInfo) => {

    if (!Number.isInteger(x) || x < 0 || x >= canvasInfo.width)
      reject(new Error("invalid x coordinate"));
    else if (!Number.isInteger(y) || y < 0 || y >= canvasInfo.height)
      reject(new Error("invalid y coordinate"));
    else if (!Number.isInteger(value) || value < 0 || value >= canvasInfo.bitdepth*canvasInfo.bitdepth)
      reject(new Error("invalid pixel value"));

    var type = "u"+canvasInfo.bitdepth; // unsigned int of length bitdepth
    var offset = canvasInfo.bitdepth*(x+y*canvasInfo.width); // bit offset to pixel
    return redis.bitfieldAsync("canvas", "SET", type, offset, value);

  });

};

module.exports = canvas;
