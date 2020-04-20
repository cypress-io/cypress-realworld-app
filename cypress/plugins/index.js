// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const cypressTypeScriptPreprocessor = require("./cy-ts-preprocessor");

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const { readFile } = require("fs").promises;
const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const getDataFile = (filename) =>
  path.join(__dirname, "../../src/data", filename);

let seedFileName = "test-seed.json";
let databaseFileName = "database.test.json";

if (process.env.NODE_ENV === "development") {
  seedFileName = "dev-seed.json";
  databaseFileName = "database.json";
}

if (process.env.EMPTY_SEED) {
  seedFileName = "empty-seed.json";
}

const databaseFile = getDataFile(databaseFileName);
const adapter = new FileSync(databaseFile);

let db = low(adapter);

const defaultStructure = {
  users: [],
};

module.exports = (on, config) => {
  on("file:preprocessor", cypressTypeScriptPreprocessor);
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    "db:seed"() {
      // seed database with test data
      return readFile(getDataFile(seedFileName), "utf-8").then((data) => {
        db.setState(JSON.parse(data)).write();
        console.log(`${seedFileName} seeded into ${databaseFileName}`);
        return null;
      });
    },
    "db:reset"() {
      // reset database to empty status
      db.setState(defaultStructure).write();
      console.log("test database reset");
      return null;
    },
  });

  //require('@cypress/code-coverage/task')(on, config)
  // IMPORTANT to return the config object
  // with the any changed environment variables
  //return config
};
