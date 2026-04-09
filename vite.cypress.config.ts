import { defineConfig, mergeConfig, loadEnv } from "vite";
import viteConfig from "./vite.config";

export default defineConfig(({ mode } = { mode: "development", command: "serve" }) =>
  mergeConfig(
    viteConfig({ mode, command: "serve" }),
    defineConfig({
      define: {
        "process.env": loadEnv("development", process.cwd(), "VITE"),
      },
      server: {
        /**
         * start the CT dev server on a different port than the full RWA
         * so users can switch between CT and E2E testing without having to
         * stop/start the RWA dev server.
         */
        port: 3002,
      },
    })
  )
);
