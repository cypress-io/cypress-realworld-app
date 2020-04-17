require("dotenv").config();

import fs from "fs";
import { flattenDeep, times, concat } from "lodash/fp";
import shortid from "shortid";
import faker from "faker";
import { getBankAccountsByUserId } from "../src/backend/database";
import {
  User,
  BankAccount,
  Transaction,
  DefaultPrivacyLevel,
  TransactionStatus,
  TransactionRequestStatus,
} from "../src/models";
import { users, getOtherRandomUser } from "./utils";
import { getFakeAmount } from "../src/utils/transactionUtils";

const paymentsPerUser = process.env.SEED_PAYMENTS_PER_USER;
const requestsPerUser = process.env.SEED_REQUESTS_PER_USER;

const isPayment = (type: string) => type === "payment";

export const createTransaction = (
  account: BankAccount,
  senderId: string,
  receiverId: string,
  type: "payment" | "request"
): Transaction => {
  const createdAt = faker.date.past();
  const modifiedAt = faker.date.recent();

  const status = faker.helpers.randomize([
    TransactionStatus.pending,
    TransactionStatus.incomplete,
    TransactionStatus.complete,
  ]);

  let requestStatus = "";

  if (type === "request") {
    requestStatus = TransactionRequestStatus.pending;

    if (status !== TransactionStatus.incomplete) {
      requestStatus = faker.helpers.randomize([
        TransactionRequestStatus.pending,
        TransactionRequestStatus.accepted,
        TransactionRequestStatus.rejected,
      ]);
    }

    if (status === TransactionStatus.complete) {
      requestStatus = faker.helpers.randomize([
        TransactionRequestStatus.accepted,
        TransactionRequestStatus.rejected,
      ]);
    }
  }

  const requestResolvedAt =
    requestStatus === TransactionRequestStatus.pending
      ? ""
      : faker.date.future(undefined, createdAt);

  return {
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
    status,
    requestStatus,
    requestResolvedAt,
    createdAt,
    modifiedAt,
  };
};

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
  console.log(user.id);
  const accounts = getBankAccountsByUserId(user.id);

  return accounts.map((account: BankAccount) => {
    // @ts-ignore
    const payments = times(() => createPayment(account, user), paymentsPerUser);
    // @ts-ignore
    const requests = times(() => createRequest(account, user), requestsPerUser);

    return concat(payments, requests);
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
