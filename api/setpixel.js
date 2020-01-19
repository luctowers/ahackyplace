const canvas = require("../lib/canvas");

module.exports = async function (request, response, next) {

  if (!request.body)
    response.status(400).send("invalid json request").end();

  try {
    await canvas.setPixel(request.body.x, request.body.y, request.body.value);
    response.sendStatus(200);
  }
  catch (error) {
    // TODO: add differentiation between bad request errors and server errors
    response.status(503).send("unable to set pixel").end();
  }

};
