const redis = require("redis");
const bluebird = require("bluebird");
const config = require("../config");

bluebird.promisifyAll(redis);

const redisClient = redis.createClient(
  config.redisPort,
  config.redishost,
  { return_buffers: true }
);

redisClient.on("connect", () => {
  console.log("Connection established to Redis server!");
});

redisClient.on("error", (error) => {
  console.log("Redis error: " + error);
});

module.exports = redisClient;
