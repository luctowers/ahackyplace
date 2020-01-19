var colors = ["#ffffff", "#e4e4e4", "#888888", "#222222", "#ffa7d1", "#e50000", "#e59500", "#a06a42", "#e5d900", "#94e044", "#02be01", "#00d3dd", "#0083c7", "#0000ea", "#cf6ee4", "#820080"];

var canvas = document.getElementById("canvas");
var container = document.getElementById("container");

var canvasData = null;

function onResize() {
  if (!canvasData)
    return;
  var containerAspectRatio = container.offsetWidth / container.offsetHeight;
  var canvasAspectRatio = canvasData.width/canvasData.height;

  if (containerAspectRatio < canvasAspectRatio) {
    canvas.width = container.offsetWidth - 64;
    canvas.height = canvas.width/canvasAspectRatio;
  }
  else {
    canvas.height = container.offsetHeight - 64;
    canvas.width = canvas.height*canvasAspectRatio;
  }

  redrawFullCanvas();
}

function onLoad() {

  fullCanvas(function(error, response) {

    if (error) {
      alert(error);
      return;
    }

    canvasData = response;
    onResize();
    canvas.style.visibility = "visible";

  });

}

function redrawFullCanvas() {

  for (var x = 0; x < canvasData.width; x++)
    for (var y = 0; y < canvasData.height; y++)
      redrawPixel(x, y);

}

function redrawPixel(x, y) {

  if (typeof canvas.getContext == "function") {
    var ctx = canvas.getContext("2d");

    var rectX = Math.floor(x * canvas.width / canvasData.width);
    var rectY = Math.floor(y * canvas.height / canvasData.height);
    var rectWidth = Math.ceil(canvas.width / canvasData.width);
    var rectHeight = Math.ceil(canvas.height / canvasData.height);

    var value = canvasData.pixels[x+y*canvasData.width];
    ctx.fillStyle = colors[value];

    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
  }

}

window.onload = onLoad;
window.onresize = onResize;

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
      var bufferView8 = new Uint8Array(buffer);
      var bufferView32 = new Uint32Array(buffer);
      var canvas = {};
      canvas.width = bufferView32[0];
      canvas.height = bufferView32[1];
      canvas.bitdepth = bufferView32[2];
      canvas.pixels = [];

      if (canvas.bitdepth != 4)
        throw new Error("Unsupported canvas bitdepth");

      for (var p = 0; p < canvas.width*canvas.height; p++) {
        var byteIndex = 12 + (p >> 1);
        if (p & 1)
          canvas.pixels.push(bufferView8[byteIndex] & 0xF);
        else
          canvas.pixels.push(bufferView8[byteIndex] >> 4);
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
