const proxy = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    proxy(["/login", "/callback", "/logout"], {
      target: `http://localhost:3001`
    })
  );
};
