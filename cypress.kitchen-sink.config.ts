import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://example.cypress.io",
    specPattern: "cypress/tests/demo/kitchen-sink.spec.ts",
    supportFile: false,
    viewportHeight: 1000,
    viewportWidth: 1280,
  },
});
