import { defineConfig } from "cypress";
import pluginFileFunction from "./cypress/plugins/index";

export default defineConfig({
  projectId: "7s5okt",
  viewportHeight: 1000,
  viewportWidth: 1280,
  retries: {
    runMode: 2,
    openMode: 1,
  },
  env: {
    apiUrl: "http://localhost:3001",
    mobileViewportWidthBreakpoint: 414,
    coverage: false,
    codeCoverage: {
      url: "http://localhost:3001/__coverage__",
    },
  },
  experimentalStudio: true,
  e2e: {
    setupNodeEvents: pluginFileFunction,
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/tests/**/*.cy.{js,jsx,ts,tsx}",
  },
});
