const express = require("express");
const canvas = require("./lib/canvas");

canvas.info().then((canvasInfo) => {
  console.log("Detected canvas info " + JSON.stringify(canvasInfo));
});

const app = express();

app.use(express.static("static"));
app.get("/api/fullcanvas", require("./api/fullcanvas"));

module.exports = app;
