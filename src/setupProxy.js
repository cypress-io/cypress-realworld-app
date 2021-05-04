const createProxyMiddleware = require("http-proxy-middleware");

require("dotenv").config();

const backendPort = process.env.BACKEND_PORT || 3001;

module.exports = function (app) {
  app.use(
    createProxyMiddleware(["/login", "/callback", "/logout", "/checkAuth", "graphql"], {
      target: `http://localhost:${backendPort}`,
      changeOrigin: true,
      logLevel: "debug",
    })
  );
};
