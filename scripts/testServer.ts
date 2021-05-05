import path from "path";
import express from "express";
import history from "connect-history-api-fallback";
import setupProxy from "../src/setupProxy";
import { frontendPort } from "../src/utils/portUtils";

const app = express();

setupProxy(app);

app.use(history());
app.use(express.static(path.join(__dirname, "../build")));

app.listen(frontendPort);
