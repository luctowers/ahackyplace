const redis = require("redis");
const bluebird = require("bluebird");
const config = require("../config");

bluebird.promisifyAll(redis);

const pubClient = redis.createClient(
  config.redisPort,
  config.redishost,
  { return_buffers: true }
);

const subClient = redis.createClient(
  config.redisPort,
  config.redishost,
  { return_buffers: true }
);

pubClient.on("error", (error) => {
  console.error("Failed to connect publisher client to Redis: " + error);
});

subClient.on("error", (error) => {
  console.error("Failed to connect subcriber client to Redis: " + error);
});

module.exports = {
  pub: pubClient,
  sub: subClient
};
