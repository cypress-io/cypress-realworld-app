const express = require("express");
const path = require("path");
const history = require("connect-history-api-fallback");
const setupProxy = require("./src/setupProxy.js");

const app = express();

setupProxy(app);

app.use(history());
app.use(express.static(path.join(__dirname, "./build")));

app.listen(3000);
