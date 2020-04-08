const express = require("express");
const path = require("path");
const setupProxy = require("./src/setupProxy.js");

const app = express();

setupProxy(app);

app.use(express.static(path.join(__dirname, "./build")));
app.listen(3000);
