const isProduction = process.env.NODE_ENV == "production";

var config = {
  isProduction: isProduction,
  port: isProduction ? process.env.PORT : 8080
};

module.exports = config;
