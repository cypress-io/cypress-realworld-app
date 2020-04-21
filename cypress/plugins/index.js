const cypressTypeScriptPreprocessor = require("./cy-ts-preprocessor");

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const { find } = require("lodash/fp");
const axios = require("axios").default;

module.exports = (on, config) => {
  on("file:preprocessor", cypressTypeScriptPreprocessor);
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    "db:seed"() {
      // seed database with test data
      return axios
        .post(`http://localhost:3001/testData/seed`)
        .then((resp) => resp.data);
    },
    "fetch:data"({ entity, findAttrs }) {
      return axios
        .get(`http://localhost:3001/testData/${entity}`)
        .then(({ data }) => find(findAttrs, data.results));
    },
  });

  // require("@cypress/code-coverage/task")(on, config);
  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config;
};
