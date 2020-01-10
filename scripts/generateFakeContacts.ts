import fs from "fs";
import _ from "lodash";
import shortid from "shortid";
import faker from "faker";
import { User } from "../src/models/user";

const testSeed = require("../src/data/test-seed.json");
const users = testSeed.users;

const contactRecords = users.map((x: User) => {
  return {
    id: shortid(),
    uuid: faker.random.uuid(),
    user_id: x.id,
    contact_user_id: _.sample(users).id, // TODO: add logic to prevent user_id === contact_user_id
    created_at: faker.date.past(),
    modified_at: faker.date.recent()
  };
});

fs.writeFile(
  __dirname + "/contacts.json",
  JSON.stringify(contactRecords),
  function() {
    console.log("contact records generated");
  }
);
