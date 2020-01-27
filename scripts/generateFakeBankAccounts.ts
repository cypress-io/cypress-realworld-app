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
      userId: x.id,
      bankName: `${faker.company.companyName()} Bank`,
      accountNumber: faker.finance.account(10),
      routingNumber: faker.finance.account(9),
      isDeleted: faker.helpers.randomize([true, false]),
      createdAt: faker.date.past(),
      modifiedAt: faker.date.recent()
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
