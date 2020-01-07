import faker from "faker";
import { User } from "../src/models/user";

const users = Array(10)
  .fill(null)
  .map(
    (x: any, i: number): User => {
      //
      return {
        id: i,
        uuid: faker.random.uuid(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        phone_number: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar(),
        // @ts-ignore
        default_privacy_level: faker.helpers.randomize([
          "public",
          "private",
          "contacts"
        ]),
        balance: faker.random.number(),
        created_at: faker.date.past(),
        modified_at: faker.date.recent()
      };
    }
  );

console.log(users);

export {}; //try hack to make it a module
