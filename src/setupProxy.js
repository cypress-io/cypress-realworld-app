const createProxyMiddleware = require("http-proxy-middleware");
require("dotenv").config();

module.exports = function (app) {
  app.use(
    createProxyMiddleware(["/login", "/callback", "/logout", "/checkAuth", "graphql"], {
      target: "http://cypress-realworld-app.dev.nbeck415.shipyard.host",
      changeOrigin: true,
      logLevel: "debug",
    })
  );
};
