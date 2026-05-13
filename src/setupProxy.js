const createProxyMiddleware = require("http-proxy-middleware");
require("dotenv").config();

const devHost = process.env.VITE_DEV_HOST ?? "127.0.0.1";
const backendPort = process.env.VITE_BACKEND_PORT || process.env.BACKEND_PORT;

module.exports = function (app) {
  app.use(
    createProxyMiddleware(["/login", "/callback", "/logout", "/checkAuth", "graphql"], {
      target: `http://${devHost}:${backendPort}`,
      changeOrigin: true,
      logLevel: "debug",
    })
  );
};
