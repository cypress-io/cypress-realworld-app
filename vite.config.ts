import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import istanbul from "vite-plugin-istanbul";

import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

export function reactVirtualized(): Plugin {
  return {
    name: "flat:react-virtualized",
    // Note: we cannot use the `transform` hook here
    //       because libraries are pre-bundled in vite directly,
    //       plugins aren't able to hack that step currently.
    //       so instead we manually edit the file in node_modules.
    //       all we need is to find the timing before pre-bundling.
    configResolved() {
      const file = require
        .resolve("react-virtualized")
        .replace(
          path.join("dist", "commonjs", "index.js"),
          path.join("dist", "es", "WindowScroller", "utils", "onScroll.js")
        );
      const code = fs.readFileSync(file, "utf-8");
      const modified = code.replace(WRONG_CODE, "");
      fs.writeFileSync(file, modified);
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE");
  return {
    // expose all vite "VITE_*" variables as process.env.VITE_* in the browser
    define: {
      "process.env": env,
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: "build",
      sourcemap: true,
    },
    plugins: [
      react(),
      eslint(),
      istanbul({
        cypress: true,
        requireEnv: true,
        exclude: ["node_modules", "cypress", "dist"],
        forceBuildInstrument: true,
      }),
      reactVirtualized(),
    ],
    // to get aws amplify to work with vite
    resolve: {
      alias: [
        {
          find: "./runtimeConfig",
          replacement: "./runtimeConfig.browser", // ensures browser compatible version of AWS JS SDK is used
        },
      ],
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/setup-tests.js",
      exclude: ["node_modules", "cypress", "dist"],
    },
  };
});
