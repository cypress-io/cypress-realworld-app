import _ from "lodash";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import Promise from "bluebird";
import { percyHealthCheck } from "@percy/cypress/task";
import codeCoverageTask from "@cypress/code-coverage/task";
const { defineConfig } = require("/Users/amir/Development/cypress/cli/lib/cypress.js");

dotenv.config({ path: ".env.local" });
dotenv.config();

module.exports = defineConfig({
  baseUrl: "http://localhost:3000",
  projectId: "7s5okt",
  integrationFolder: "cypress/tests",
  viewportHeight: 1000,
  viewportWidth: 1280,
  env: {
    apiUrl: "http://localhost:3001",
    mobileViewportWidthBreakpoint: 414,
    coverage: false,
    codeCoverage: {
      url: "http://localhost:3001/__coverage__",
    },
    defaultPassword: process.env.SEED_DEFAULT_USER_PASSWORD,
    paginationPageSize: process.env.PAGINATION_PAGE_SIZE,
  },
  e2e: {
    setupNodeEvents(on, config) {
      const testDataApiEndpoint = `${config.env.apiUrl}/testData`;

      const queryDatabase = ({ entity, query }, callback) => {
        const fetchData = async (attrs) => {
          const { data } = await axios.get(`${testDataApiEndpoint}/${entity}`);
          return callback(data, attrs);
        };

        return Array.isArray(query) ? Promise.map(query, fetchData) : fetchData(query);
      };

      on("task", {
        percyHealthCheck,
        async "db:seed"() {
          // seed database with test data
          const { data } = await axios.post(`${testDataApiEndpoint}/seed`);
          return data;
        },

        // fetch test data from a database (MySQL, PostgreSQL, etc...)
        "filter:database"(queryPayload) {
          return queryDatabase(queryPayload, (data, attrs) => _.filter(data.results, attrs));
        },
        "find:database"(queryPayload) {
          return queryDatabase(queryPayload, (data, attrs) => _.find(data.results, attrs));
        },
      });

      codeCoverageTask(on, config);
      return config;
    },
  },
});
