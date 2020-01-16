import fs from "fs";
import shortid from "shortid";
import faker from "faker";
import { User } from "../src/models/user";
import { BankAccount } from "../src/models/bankaccount";
import { users } from "./utils";

const bankAccounts = users.map(
  (x: User): BankAccount => {
    return {
      id: shortid(),
      uuid: faker.random.uuid(),
      user_id: x.id,
      bank_name: `${faker.company.companyName()} Bank`,
      account_number: faker.finance.account(10),
      routing_number: faker.finance.account(9),
      is_deleted: faker.helpers.randomize([true, false]),
      created_at: faker.date.past(),
      modified_at: faker.date.recent()
    };
  }
);

fs.writeFile(
  __dirname + "/bankaccounts.json",
  JSON.stringify(bankAccounts),
  function() {
    console.log("bank account records generated");
  }
);
