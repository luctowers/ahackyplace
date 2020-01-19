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

module.exports = {
  pub: pubClient,
  sub: subClient
};
