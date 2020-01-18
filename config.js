const isProduction = process.env.NODE_ENV == "production";

var config = {
  isProduction: isProduction,
  port: isProduction ? process.env.PORT : 8080,
  redisHost: isProduction ? process.env.REDIS_HOST : "localhost",
  redisPort: isProduction ? process.env.REDIS_PORT : 6379
};

module.exports = config;
