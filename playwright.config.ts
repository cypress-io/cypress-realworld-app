import { defineConfig } from "@playwright/test";
import "dotenv/config";

console.assert(process.env.PLAYWRIGHT_BACKEND_URL, "PLAYWRIGHT_BACKEND_URL is not set");
console.assert(process.env.SEED_DEFAULT_USER_PASSWORD, "SEED_DEFAULT_USER_PASSWORD is not set");

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PLAYWRIGHT_BACKEND_URL: string;
      SEED_DEFAULT_USER_PASSWORD: string;
    }
  }
}

export default defineConfig({
  testDir: "playwright/__tests__",
  timeout: 5000,
  use: {
    baseURL: "http://localhost:3000",
  },
});
