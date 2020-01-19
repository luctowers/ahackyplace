function setPixel(x, y, value, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/setpixel", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  if (callback)
    xhr.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status == 200)
          callback(null);
        else
          callback(new Error("Failed to set pixel"));
      }
    }
  xhr.send(JSON.stringify({x: x, y: y, value: value}));
}

function fullCanvas(callback) {

  function processBinaryCanvas(buffer) {
    try {
      var bufferView8 = new Int8Array(buffer);
      var bufferView32 = new Int32Array(buffer);
      var canvas = {};
      canvas.width = bufferView32[0];
      canvas.height = bufferView32[1];
      canvas.bitdepth = bufferView32[2];
      canvas.data = [];

      if (canvas.bitdepth != 4)
        throw new Error("Unsupported canvas bitdepth");

      for (var p = 0; p < canvas.width*canvas.height; p++) {
        var byteIndex = 12 + (p >> 1);
        if (p & 1)
          canvas.data.push(bufferView8[byteIndex] & 0xF);
        else
          canvas.data.push(bufferView8[byteIndex] >> 4);
      }

      callback(null, canvas);
    }
    catch (error) {
      callback(error, null);
    }
  }

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/api/fullcanvas", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.responseType = "arraybuffer";
  if (callback)
    xhr.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE)
        if (this.status == 200)
          processBinaryCanvas(this.response);
        else
          callback(new Error("Failed to get canvas"), null);
    }
  xhr.send();

}
