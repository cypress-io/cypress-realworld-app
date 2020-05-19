import { Express } from "express";
import proxy from "http-proxy-middleware";

export default function (app: Express) {
  app.use(
    proxy(["/login", "/callback", "/logout"], {
      target: `http://localhost:3001`,
    })
  );
}
