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

let adapter = new FileSync(
  path.join(__dirname, "../../src/data/database.test.json")
);
let db = low(adapter);

const defaultStructure = {
  users: []
};

module.exports = (on, config) => {
  on("file:preprocessor", cypressTypeScriptPreprocessor);
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    "db:seed"() {
      // seed database with test data
      return readFile(
        path.join(__dirname, "../../src/data/test-seed.json"),
        "utf-8"
      ).then(data => {
        db.setState(JSON.parse(data)).write();
        console.log("test data seeded into test database");
        return null;
      });
    },
    "db:reset"() {
      // reset database to empty status
      db.setState(defaultStructure).write();
      console.log("test database reset");
      return null;
    }
  });
};
