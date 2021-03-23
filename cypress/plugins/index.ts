/* eslint-disable import/no-anonymous-default-export */
import _ from "lodash";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import Promise from "bluebird";
import { percyHealthCheck } from "@percy/cypress/task";
import codeCoverageTask from "@cypress/code-coverage/task";

dotenv.config({ path: ".env.local" });
dotenv.config();

const awsConfig = require(path.join(__dirname, "../../aws-exports-es5.js"));

export default (on: (arg0: string, arg1: {
    percyHealthCheck: any; "db:seed"(): globalThis.Promise<any>;
    // fetch test data from a database (MySQL, PostgreSQL, etc...)
    "filter:database"(queryPayload: any): globalThis.Promise<any>; "find:database"(queryPayload: any): globalThis.Promise<any>;
  }) => void, config: { env: { defaultPassword: string | undefined; paginationPageSize: string | undefined; auth0_username: string | undefined; auth0_password: string | undefined; auth0_domain: string | undefined; auth0_audience: string | undefined; auth0_scope: string | undefined; auth0_client_id: string | undefined; auth0_client_secret: string | undefined; auth_token_name: string | undefined; okta_username: string | undefined; okta_password: string | undefined; okta_domain: string | undefined; okta_client_id: string | undefined; cognito_username: string | undefined; cognito_password: string | undefined; awsConfig: any; googleRefreshToken: string | undefined; googleClientId: string | undefined; googleClientSecret: string | undefined; apiUrl: any; }; }) => {
  config.env.defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD;
  config.env.paginationPageSize = process.env.PAGINATION_PAGE_SIZE;
  // Auth0
  config.env.auth0_username = process.env.AUTH0_USERNAME;
  config.env.auth0_password = process.env.AUTH0_PASSWORD;
  config.env.auth0_domain = process.env.REACT_APP_AUTH0_DOMAIN;
  config.env.auth0_audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  config.env.auth0_scope = process.env.REACT_APP_AUTH0_SCOPE;
  config.env.auth0_client_id = process.env.REACT_APP_AUTH0_CLIENTID;
  config.env.auth0_client_secret = process.env.AUTH0_CLIENT_SECRET;
  config.env.auth_token_name = process.env.REACT_APP_AUTH_TOKEN_NAME;
  // Okta
  config.env.okta_username = process.env.OKTA_USERNAME;
  config.env.okta_password = process.env.OKTA_PASSWORD;
  config.env.okta_domain = process.env.REACT_APP_OKTA_DOMAIN;
  config.env.okta_client_id = process.env.REACT_APP_OKTA_CLIENTID;

  // Amazon Cognito
  config.env.cognito_username = process.env.AWS_COGNITO_USERNAME;
  config.env.cognito_password = process.env.AWS_COGNITO_PASSWORD;
  config.env.awsConfig = awsConfig.default;

  // Google
  config.env.googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  config.env.googleClientId = process.env.REACT_APP_GOOGLE_CLIENTID;
  config.env.googleClientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

  const testDataApiEndpoint = `${config.env.apiUrl}/testData`;

  const queryDatabase = ({ entity, query }: any, callback: { (data: any, attrs: any): string[]; (data: any, attrs: any): unknown; (arg0: any, arg1: any): any; }) => {
    const fetchData = async (attrs: any) => {
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
    "filter:database"(queryPayload: { entity: any; query: any; }) {
      return queryDatabase(queryPayload, (data: { results: string | null | undefined; }, attrs: _.StringIterator<boolean> | undefined) => _.filter(data.results, attrs));
    },
    "find:database"(queryPayload: { entity: any; query: any; }) {
      return queryDatabase(queryPayload, (data: { results: _.List<unknown> | null | undefined; }, attrs: _.ListIteratorTypeGuard<unknown, unknown>) => _.find(data.results, attrs));
    },
  });

  codeCoverageTask(on, config);
  return config;
};
