import path from "path";
import express from "express";
import history from "connect-history-api-fallback";
import setupProxy from "../src/setupProxy";

require("dotenv").config();

const app = express();
const frontendPort = process.env.PORT || 3000;

setupProxy(app);

app.use(history());
app.use(express.static(path.join(__dirname, "../build")));

app.listen(frontendPort);
