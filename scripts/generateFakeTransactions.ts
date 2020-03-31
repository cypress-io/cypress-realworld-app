import fs from "fs";
import { flattenDeep } from "lodash/fp";
import shortid from "shortid";
import faker from "faker";
import { getBankAccountsByUserId } from "../src/backend/database";
import {
  User,
  BankAccount,
  Transaction,
  DefaultPrivacyLevel,
  TransactionStatus,
  RequestStatus,
} from "../src/models";
import { users, getOtherRandomUser } from "./utils";
import { getFakeAmount } from "../src/utils/transactionUtils";

const isPayment = (type: string) => type === "payment";

export const createTransaction = (
  account: BankAccount,
  senderId: string,
  receiverId: string,
  type: "payment" | "request"
): Transaction => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  source: account.id,
  amount: getFakeAmount(),
  description: isPayment(type)
    ? `Payment: ${senderId} to ${receiverId}`
    : `Request: ${receiverId} to ${senderId}`,
  privacyLevel: faker.helpers.randomize([
    DefaultPrivacyLevel.public,
    DefaultPrivacyLevel.private,
    DefaultPrivacyLevel.contacts,
  ]),
  receiverId,
  senderId,
  balanceAtCompletion: getFakeAmount(),
  status: faker.helpers.randomize([
    TransactionStatus.pending,
    TransactionStatus.incomplete,
    TransactionStatus.complete,
  ]),
  requestStatus:
    type === "request"
      ? RequestStatus.pending
      : faker.helpers.randomize([
          RequestStatus.pending,
          RequestStatus.accepted,
          RequestStatus.rejected,
        ]),
  requestResolvedAt: faker.date.future(),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

export const createPayment = (account: BankAccount, user: User) =>
  createTransaction(
    account,
    user.id,
    getOtherRandomUser(user.id).id,
    "payment"
  );

export const createRequest = (account: BankAccount, user: User) =>
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

const flatTransactions = flattenDeep(transactions);

fs.writeFile(
  __dirname + "/transactions.json",
  JSON.stringify(flatTransactions),
  function () {
    console.log("transaction records generated");
  }
);
