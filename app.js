const express = require("express");
const bodyParser = require("body-parser");
const canvas = require("./lib/canvas");

canvas.info().then((canvasInfo) => {
  console.log("Detected canvas info " + JSON.stringify(canvasInfo));
});

const app = express();

app.use(bodyParser.json());
app.use(express.static("static"));
app.get("/api/fullcanvas", require("./api/fullcanvas"));
app.post("/api/setpixel", require("./api/setpixel"));

module.exports = app;
