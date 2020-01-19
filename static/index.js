// CONSTANTS (can't const because of browser compatibility)

var colors = ["#ffffff", "#e4e4e4", "#888888", "#222222", "#ffa7d1", "#e50000", "#e59500", "#a06a42", "#e5d900", "#94e044", "#02be01", "#00d3dd", "#0083c7", "#0000ea", "#cf6ee4", "#820080"];
var canvasMargin = 64;
var reconnectDelay = 1000;

// DOM ELEMENTS

var canvasElement = document.getElementById("canvas");
var containerElement = document.getElementById("container");

// VARIABLES

var websocket;
var pendingPixels = [];
var canvasPending = true;
var canvasPixels = [];
var canvasWidth = 0;
var canvasHeight = 0;

// HANDLE RESIZES BY RESIZING AND REDRAWING CANVAS

function onResize() {
  if (!canvasWidth || !canvasHeight)
    return;
  var containerAspectRatio = containerElement.offsetWidth / containerElement.offsetHeight;
  var canvasAspectRatio = canvasWidth / canvasHeight;

  if (containerAspectRatio < canvasAspectRatio) {
    canvasElement.width = containerElement.offsetWidth - canvasMargin;
    canvasElement.height = canvasElement.width/canvasAspectRatio;
  }
  else {
    canvasElement.height = containerElement.offsetHeight - canvasMargin;
    canvasElement.width = canvasElement.height*canvasAspectRatio;
  }

  redrawFullCanvas();
}

// WEBSOCKET CODE (listens for newly placed pixels)

function openNewWebsocket() {
  // create the socket
  websocket = new WebSocket("ws://" + window.location.host + "/");
  websocket.binaryType = "arraybuffer";

  // on open we will automattically be listening for canvas updates
  // after that get a copy of the full canvas and we will add the new pixels
  // once it arrives
  websocket.onopen = function() {
    apiFullCanvas(function(error, canvasData) {
      if (error) {
        console.log(error);
        return;
      }
      canvasPending = false;
      canvasWidth = canvasData.width;
      canvasHeight = canvasData.height;
      canvasPixels = canvasData.pixels;
      flushPendingPixels();

      onResize();
      canvas.style.visibility = "visible";
    })
  };

  // attempt to re-establish the connection if it drops
  function attemptRecconect() {
    pendingPixels = [];
    canvasPending = true;
    setTimeout(openNewWebsocket, reconnectDelay);
  }
  websocket.onclose = attemptRecconect;
  websocket.onerror = attemptRecconect;

  // handle new data from the server
  websocket.onmessage = function(message) {
    var bufferView32 = new Uint32Array(message.data);
    pendingPixels.push(bufferView32);
    if (!canvasPending)
      flushPendingPixels();
  };
}

// CANVAS DRAWING FUNCTIONS

function flushPendingPixels() {canvas

  for (var p = 0; p < pendingPixels.length; p++) {
    var pixelX = pendingPixels[p][0];
    var pixelY = pendingPixels[p][1];
    var pixelValue = pendingPixels[p][2];
    canvasPixels[pixelX+pixelY*canvasWidth] = pixelValue;
    redrawPixel(pixelX, pixelY);
  }
  pendingPixels = [];

}

function redrawFullCanvas() {

  for (var x = 0; x < canvasWidth; x++)
    for (var y = 0; y < canvasHeight; y++)
      redrawPixel(x, y);

}

function redrawPixel(x, y) {

  if (typeof canvasElement.getContext == "function") {
    var ctx = canvas.getContext("2d");

    var rectX = Math.floor(x * canvasElement.width / canvasWidth);
    var rectY = Math.floor(y * canvasElement.height / canvasHeight);
    var rectWidth = Math.ceil(canvasElement.width / canvasWidth);
    var rectHeight = Math.ceil(canvasElement.height / canvasHeight);

    var value = canvasPixels[x+y*canvasWidth];
    ctx.fillStyle = colors[value];

    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
  }

}

// API FUNCTIONS

function apiSetPixel(x, y, value, callback) {
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

function apiFullCanvas(callback) {

  function processBinaryCanvas(buffer) {
    try {
      var bufferView8 = new Uint8Array(buffer);
      var bufferView32 = new Uint32Array(buffer);
      var canvasData = {};
      canvasData.width = bufferView32[0];
      canvasData.height = bufferView32[1];
      canvasData.bitdepth = bufferView32[2];
      canvasData.pixels = [];

      if (canvasData.bitdepth != 4)
        throw new Error("Unsupported canvas bitdepth");

      for (var p = 0; p < canvasData.width*canvasData.height; p++) {
        var byteIndex = 12 + (p >> 1);
        if (p & 1)
          canvasData.pixels.push(bufferView8[byteIndex] & 0xF);
        else
          canvasData.pixels.push(bufferView8[byteIndex] >> 4);
      }

      callback(null, canvasData);
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

// SET HANDLERS

window.onload = openNewWebsocket;
window.onresize = onResize;
