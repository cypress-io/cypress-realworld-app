import _ from "lodash";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import Promise from "bluebird";
import AWS from "aws-sdk";
import Amplify, { Auth } from "aws-amplify";
import { percyHealthCheck } from "@percy/cypress/task";
import codeCoverageTask from "@cypress/code-coverage/task";

const awsConfig = require(path.join(__dirname, "../../aws-exports-es5.js"));

dotenv.config();

const { aws_project_region } = awsConfig;

AWS.config.update({ region: aws_project_region });
Amplify.configure(awsConfig);

const loginCognitoUserByApi = async ({ username, password }) => {
  global.fetch = require("node-fetch");
  return await Auth.signIn({ username, password });
};

export default (on, config) => {
  config.env.defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD;
  config.env.paginationPageSize = process.env.PAGINATION_PAGE_SIZE;
  config.env.auth_username = process.env.AUTH_USERNAME;
  config.env.auth_password = process.env.AUTH_PASSWORD;
  // Auth0
  config.env.auth0_domain = process.env.REACT_APP_AUTH0_DOMAIN;
  config.env.auth0_audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  config.env.auth0_scope = process.env.REACT_APP_AUTH0_SCOPE;
  config.env.auth0_client_id = process.env.REACT_APP_AUTH0_CLIENTID;
  config.env.auth0_client_secret = process.env.AUTH0_CLIENT_SECRET;
  config.env.auth_token_name = process.env.REACT_APP_AUTH_TOKEN_NAME;
  // Okta
  config.env.okta_domain = process.env.REACT_APP_OKTA_DOMAIN;
  config.env.okta_client_id = process.env.REACT_APP_OKTA_CLIENTID;

  // Amazon Cognito
  config.env.cognito_username = process.env.AWS_COGNITO_USERNAME;
  config.env.cognito_password = process.env.AWS_COGNITO_PASSWORD;

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
    loginCognitoUserByApi,
  });

  codeCoverageTask(on, config);
  return config;
};
