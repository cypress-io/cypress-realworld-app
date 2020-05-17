const _ = require("lodash");
const Promise = require("bluebird");
const axios = require("axios").default;

require("dotenv").config();

module.exports = (on, config) => {
  config.env.defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD;
  config.env.paginationPageSize = process.env.PAGINATION_PAGE_SIZE;

  on("task", {
    "db:seed"() {
      // seed database with test data
      return axios.post(`${config.env.apiUrl}/testData/seed`).then((resp) => resp.data);
    },

    // fetch test data from a database (MySQL, PostgreSQL, etc...)
    "filter:testData"({ entity, filterAttrs }) {
      const fetchData = (attrs) => {
        return axios
          .get(`${config.env.apiUrl}/testData/${entity}`)
          .then(({ data }) => _.filter(data.results, attrs));
      };

      if (Array.isArray(filterAttrs)) {
        return Promise.map(filterAttrs, fetchData);
      }
      return fetchData(filterAttrs);
    },
    "find:testData"({ entity, findAttrs }) {
      const fetchData = (attrs) => {
        return axios
          .get(`${config.env.apiUrl}/testData/${entity}`)
          .then(({ data }) => _.find(data.results, attrs));
      };

      if (Array.isArray(findAttrs)) {
        return Promise.map(findAttrs, fetchData);
      }
      return fetchData(findAttrs);
    },

    queryDatabase({ operation, entity, query }) {
      const isBulkQuery = Array.isArray(query);
      const fetchData = (q) => {
        return axios
          .get(`${config.env.apiUrl}/testData/${entity}`)
          .then(({ data }) => _[operation](data.results, q));
      };

      return isBulkQuery ? Promise.map(query, fetchData) : fetchData(query);
    },
  });

  require("@cypress/code-coverage/task")(on, config);
  return config;
};
