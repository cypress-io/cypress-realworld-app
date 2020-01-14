import fs from "fs";
import _ from "lodash";
import shortid from "shortid";
import faker from "faker";
import { User } from "../src/models/user";
import { users, getOtherRandomUser } from "./utils";

const contactRecords = users.map((user: User) => {
  return Array(3)
    .fill(null)
    .map(() => ({
      id: shortid(),
      uuid: faker.random.uuid(),
      user_id: user.id,
      contact_user_id: getOtherRandomUser(user.id).id,
      created_at: faker.date.past(),
      modified_at: faker.date.recent()
    }));
});

const flatContactRecords = _.flattenDeep(contactRecords);

fs.writeFile(
  __dirname + "/contacts.json",
  JSON.stringify(flatContactRecords),
  function() {
    console.log("contact records generated");
  }
);
