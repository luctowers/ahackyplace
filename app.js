const express = require("express");
const redis = require("redis");
const config = require("./config");

// REDIS

const redisClient = redis.createClient({
  host: config.redishost,
  port: config.redisPort
});

redisClient.on("connect", () => {
  console.log("Connection established to Redis server!");
});

redisClient.on("error", (error) => {
  console.log("Redis error: " + error);
});

// EXPRESS

const app = express();

app.use(express.static("static"));

module.exports = app;
