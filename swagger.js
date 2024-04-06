var express = require("express");

const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const swaggerDocument = YAML.load(path.join(__dirname, "/swagger.yml"));
const routes = express.Router();

routes.use(
  "/api/swagger",
  (req, res, next) => {
    (swaggerDocument.servers = [
      {
        url: "http://localhost:3000",
      },
    ]),
      (req.swaggerDoc = swaggerDocument);
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

module.exports = routes;