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
      userId: user.id,
      contactUserId: getOtherRandomUser(user.id).id,
      createdAt: faker.date.past(),
      modifiedAt: faker.date.recent()
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
