const Promise = require("bluebird");
const axios = require("axios").default;
const { find, filter } = require("lodash/fp");

require("dotenv").config();

module.exports = (on, config) => {
  config.env.defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD;
  config.env.paginationPageSize = process.env.PAGINATION_PAGE_SIZE;
  config.env.mobileViewportWidth = process.env.MOBILE_VIEWPORT_WIDTH;
  const baseApiUrl = process.env.BASE_API_URL;

  on("task", {
    "db:seed"() {
      // seed database with test data
      return axios.post(`${baseApiUrl}/testData/seed`).then((resp) => resp.data);
    },
    // fetch test data from a database (MySQL, PostgreSQL, etc...)
    "filter:testData"({ entity, filterAttrs }) {
      const fetchData = (attrs) => {
        return axios
          .get(`${baseApiUrl}/testData/${entity}`)
          .then(({ data }) => filter(attrs, data.results));
      };

      if (Array.isArray(filterAttrs)) {
        return Promise.map(filterAttrs, fetchData);
      }
      return fetchData(filterAttrs);
    },
    "find:testData"({ entity, findAttrs }) {
      const fetchData = (attrs) => {
        return axios
          .get(`${baseApiUrl}/testData/${entity}`)
          .then(({ data }) => find(attrs, data.results));
      };

      if (Array.isArray(findAttrs)) {
        return Promise.map(findAttrs, fetchData);
      }
      return fetchData(findAttrs);
    },
  });

  require("@cypress/code-coverage/task")(on, config);
  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config;
};
