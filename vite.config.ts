import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    entries: ["index.html"],
    include: ["lodash/fp"],
    exclude: ["./coverage", "./build"],
  },
  server: {
    cors: { origin: "https://localhost:3000", credentials: true },
    proxy: {
      "/login": "http://localhost:3001/login",
      "/callback": "http://localhost:3001/callback",
      "/logout": "http://localhost:3001/logout",
      "/checkAuth": "http://localhost:3001/checkAuth",
    },
  },
  plugins: [reactRefresh()],
});
