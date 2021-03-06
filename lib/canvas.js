const EventEmitter = require("events");
const redis = require("./redis");
const memoryHelper = require("./memory-helper");

var canvasInfoPromise = redis.pub.multi()
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

class Canvas extends EventEmitter {

  constructor() {
    super();
    redis.sub.subscribe("canvas_pixels");
    redis.sub.on("message", (channel, message) => {
      if (channel == "canvas_pixels")
        this.emit("newpixel", message)
    });
  }

  info() {
    return canvasInfoPromise;
  }

  async setPixel(x, y, value) {

    const canvasInfo = await canvasInfoPromise;
  
    if (!Number.isInteger(x) || x < 0 || x >= canvasInfo.width)
      throw new Error("invalid x coordinate");
    else if (!Number.isInteger(y) || y < 0 || y >= canvasInfo.height)
      throw new Error("invalid y coordinate");
    else if (!Number.isInteger(value) || value < 0 || value >= canvasInfo.bitdepth*canvasInfo.bitdepth)
      throw new Error("invalid pixel value");
  
    var type = "u"+canvasInfo.bitdepth; // unsigned int of length bitdepth
    var offset = canvasInfo.bitdepth*(x+y*canvasInfo.width); // bit offset to pixel

    return redis.pub.multi()
      .bitfield("canvas", "SET", type, offset, value)
      .publish("canvas_pixels", memoryHelper.int32ArrayToBuffer([x, y, value]))
      .execAsync();
  
  }

  async data() {

    const canvasInfo = await canvasInfoPromise;
    var canvasData = await redis.pub.getAsync("canvas");
  
    var desiredBytes = Math.ceil(canvasInfo.width * canvasInfo.height * canvasInfo.bitdepth / 8);
    desiredBytes = desiredBytes + (desiredBytes & 0x3); // ensure desiredBytes is a multiple of 32 bits
    if (canvasData.length > desiredBytes)
      canvasData = canvasData.slice(0, desiredBytes);
    else if (canvasData.length < desiredBytes) {
      const padBuffer = Buffer.alloc(desiredBytes - canvasData.length);
      canvasData = Buffer.concat([canvasData, padBuffer]);
    }
  
    return canvasData;
  
  }

}

module.exports = new Canvas();
