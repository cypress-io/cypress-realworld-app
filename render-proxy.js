import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";

const PUBLIC_PORT = process.env.PORT || 10000;
const FRONTEND_PORT = 3000;
const BACKEND_PORT = 3001;

// Start RWA (starts frontend on 3000 + backend on 3001 by default)
spawn("yarn", ["dev"], { stdio: "inherit", shell: true });

const app = express();

// Backend API (RWA backend routes are under /api)
app.use(
  "/api",
  createProxyMiddleware({
    target: `http://127.0.0.1:${BACKEND_PORT}`,
    changeOrigin: true,
  })
);

// Everything else -> frontend
app.use(
  "/",
  createProxyMiddleware({
    target: `http://127.0.0.1:${FRONTEND_PORT}`,
    changeOrigin: true,
    ws: true,
  })
);

app.listen(PUBLIC_PORT, "0.0.0.0", () => {
  console.log(`Proxy listening on ${PUBLIC_PORT}`);
});
