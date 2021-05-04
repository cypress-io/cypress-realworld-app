const createProxyMiddleware = require("http-proxy-middleware");

const { backendPort } = require("utils/portUtils");

module.exports = function (app) {
  app.use(
    createProxyMiddleware(["/login", "/callback", "/logout", "/checkAuth", "graphql"], {
      target: `http://localhost:${backendPort}`,
      changeOrigin: true,
      logLevel: "debug",
    })
  );
};
