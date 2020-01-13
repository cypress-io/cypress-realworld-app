import fs from "fs";
import _ from "lodash";
import shortid from "shortid";
import faker from "faker";
import { getBankAccountsBy } from "../src/backend/database";
import {
  User,
  BankAccount,
  Transaction,
  DefaultPrivacyLevel,
  TransactionStatus,
  RequestStatus
} from "../src/models";

const testSeed = require("../src/data/test-seed.json");
//const testSeedObj = JSON.parse(JSON.stringify(testSeed));
//const users = testSeedObj.users;
const users = testSeed.users;
console.log("users: ", users);

// returns a random user other than the one passed in
const getOtherRandomUser = (user_id: string) =>
  _.sample(_.reject(users, ["id", user_id]));

const isPayment = (type: string) => type === "payment";

const createTransaction = (
  account: BankAccount,
  sender_id: string,
  receiver_id: string,
  type: "payment" | "request"
): Transaction => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  source: account.id,
  amount: faker.finance.amount(),
  description: isPayment
    ? `Payment: ${sender_id} to ${receiver_id}`
    : `Request: ${receiver_id} to ${sender_id}`,
  privacy_level: faker.helpers.randomize([
    DefaultPrivacyLevel.public,
    DefaultPrivacyLevel.private,
    DefaultPrivacyLevel.contacts
  ]),
  receiver_id,
  sender_id,
  balance_at_completion: faker.finance.amount(),
  status: faker.helpers.randomize([
    TransactionStatus.pending,
    TransactionStatus.incomplete,
    TransactionStatus.complete
  ]),
  request_status:
    type === "request"
      ? RequestStatus.pending
      : faker.helpers.randomize([
          RequestStatus.pending,
          RequestStatus.accepted,
          RequestStatus.rejected
        ]),
  request_resolved_at: faker.date.future(),
  created_at: faker.date.past(),
  modified_at: faker.date.recent()
});

const createPayment = (account: BankAccount, user: User) =>
  createTransaction(account, user.id, getOtherRandomUser(user.id), "payment");

const createRequest = (account: BankAccount, user: User) =>
  createTransaction(account, user.id, getOtherRandomUser(user.id), "request");

const transactions = users.map((user: User): Transaction[] => {
  console.log({ user });
  console.log("UID: <", user.id, ">");
  const accounts = getBankAccountsBy("user_id", user.id.trim());
  console.log({ accounts });

  return accounts.map((account: BankAccount) => {
    return createPayment(account, user);
    //return [createPayment(account, user), createRequest(account, user)];
  });

  //return _.flatten(transactions);
});

fs.writeFile(
  __dirname + "/transactions.json",
  JSON.stringify(transactions),
  function() {
    console.log("transaction records generated");
  }
);
