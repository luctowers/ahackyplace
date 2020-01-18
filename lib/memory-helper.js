module.exports = {};

module.exports.int32ArrayToBuffer = function(array) {
  const buffer = Buffer.allocUnsafe(array.length*4);
  for (var i = 0; i < array.length; i++)
    buffer.writeInt32LE(array[i], i*4);
  return buffer;
};
