import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  optimizeDeps: {
    include: ["lodash/fp"],
  },
  plugins: [reactRefresh(), svgr()],
});
