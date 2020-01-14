import fs from "fs";
import _ from "lodash";
import shortid from "shortid";
import faker from "faker";
import { getBankAccountsByUserId } from "../src/backend/database";
import {
  User,
  BankAccount,
  Transaction,
  DefaultPrivacyLevel,
  TransactionStatus,
  RequestStatus
} from "../src/models";
import { users, getOtherRandomUser } from "./utils";

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
  createTransaction(
    account,
    user.id,
    getOtherRandomUser(user.id).id,
    "payment"
  );

const createRequest = (account: BankAccount, user: User) =>
  createTransaction(
    account,
    user.id,
    getOtherRandomUser(user.id).id,
    "request"
  );

const transactions = users.map((user: User): Transaction[][] => {
  const accounts = getBankAccountsByUserId(user.id);

  return accounts.map((account: BankAccount) => {
    return [createPayment(account, user), createRequest(account, user)];
  });
});

const flatTransactions = _.flattenDeep(transactions);

fs.writeFile(
  __dirname + "/transactions.json",
  JSON.stringify(flatTransactions),
  function() {
    console.log("transaction records generated");
  }
);
