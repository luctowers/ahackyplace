const express = require("express");
const canvas = require("./lib/canvas");

canvas.info().then((canvasInfo) => {
  console.log("Detected canvas info " + JSON.stringify(canvasInfo));
});

// if the canvas's bitdepth is 4 this is will set the byte of the canvas to 'A'
// 'A' = 0100 (4) 0001 (1)
canvas.setPixel(0, 0, 4);
canvas.setPixel(1, 0, 1);

const app = express();

app.use(express.static("static"));

module.exports = app;
