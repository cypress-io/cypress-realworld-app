import _ from "lodash";
import Promise from "bluebird";
import axios from "axios";
import dotenv from "dotenv";
import "cypress";

type dbQueryArg = {
  entity: string;
  query: object | [object];
};

type dbQueryCallback = (data: testDataPayload, attrs: any) => any;

type testDataPayload = {
  results: [];
};

dotenv.config();

// @ts-ignore
export default (on, config) => {
  config.env.defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD;
  config.env.paginationPageSize = process.env.PAGINATION_PAGE_SIZE;

  const testDataApiEndpoint = `${config.env.apiUrl}/testData`;

  const queryDatabase = ({ entity, query }: dbQueryArg, callback: dbQueryCallback) => {
    const fetchData = (attrs: any) => {
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
    "filter:database"(queryPayload: dbQueryArg) {
      return queryDatabase(queryPayload, (data, attrs) => _.filter(data.results, attrs));
    },
    "find:database"(queryPayload: dbQueryArg) {
      return queryDatabase(queryPayload, (data, attrs) => _.find(data.results, attrs));
    },
  });

  require("@cypress/code-coverage/task")(on, config);
  return config;
};
