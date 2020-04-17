import fs from "fs";
import shortid from "shortid";
import faker from "faker";
import bcrypt from "bcryptjs";
import { User } from "../src/models/user";

const passwordHash = bcrypt.hashSync("s3cret", 10);

const users = Array(10)
  .fill(null)
  .map(
    (): User => {
      //
      return {
        id: shortid(),
        uuid: faker.random.uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: passwordHash,
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar(),
        // @ts-ignore
        defaultPrivacyLevel: faker.helpers.randomize([
          "public",
          "private",
          "contacts",
        ]),
        balance: faker.random.number(),
        createdAt: faker.date.past(),
        modifiedAt: faker.date.recent(),
      };
    }
  );

fs.writeFile(__dirname + "/users.json", JSON.stringify(users), function () {
  console.log("users generated");
});
