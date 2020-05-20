import _ from "lodash";
import Promise from "bluebird";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// @ts-ignore
export default (on, config) => {
  config.env.defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD;
  config.env.paginationPageSize = process.env.PAGINATION_PAGE_SIZE;

  const testDataApiEndpoint = `${config.env.apiUrl}/testData`;

  const queryDatabase = ({ entity, query }, callback) => {
    const fetchData = (attrs) => {
      return axios
        .get(`${testDataApiEndpoint}/${entity}`)
        .then(({ data }) => callback(data, attrs));
    };

    return Array.isArray(query) ? Promise.map(query, fetchData) : fetchData(query);
  };

  on("task", {
    "db:seed"() {
      // seed database with test data
      return axios.post(`${testDataApiEndpoint}/seed`).then((resp) => resp.data);
    },

    // fetch test data from a database (MySQL, PostgreSQL, etc...)
    "filter:database"(queryPayload) {
      return queryDatabase(queryPayload, (data, attrs) => _.filter(data.results, attrs));
    },
    "find:database"(queryPayload) {
      return queryDatabase(queryPayload, (data, attrs) => _.find(data.results, attrs));
    },
  });

  require("@cypress/code-coverage/task")(on, config);
  return config;
};
