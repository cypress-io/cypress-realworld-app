/* eslint-disable import/first */
require("dotenv").config();

import fs from "fs";
import faker from "faker";
import shortid from "shortid";
import { flattenDeep, times, concat } from "lodash/fp";
import { users, getOtherRandomUser } from "./utils";
import { getFakeAmount } from "../src/utils/transactionUtils";
import { getBankAccountsByUserId } from "../backend/database";
import {
  User,
  BankAccount,
  Transaction,
  DefaultPrivacyLevel,
  TransactionStatus,
  TransactionRequestStatus,
  TransactionScenario,
  FakeTransaction,
} from "../src/models";

const paymentsPerUser = process.env.SEED_PAYMENTS_PER_USER;
const requestsPerUser = process.env.SEED_REQUESTS_PER_USER;

const isPayment = (type: string) => type === "payment";

export const createTransaction = (
  type: "payment" | "request",
  account: BankAccount,
  details: FakeTransaction
): Transaction => {
  const { senderId, receiverId } = details;

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

export const createPayment = (account: BankAccount, user: User) => {
  const paymentScenarios: TransactionScenario[] = [
    {
      status: TransactionStatus.pending,
      requestStatus: "",
    },
    {
      status: TransactionStatus.incomplete,
      requestStatus: "",
    },
    {
      status: TransactionStatus.complete,
      requestStatus: "",
    },
  ];

  const receiverId = getOtherRandomUser(user.id).id;

  return paymentScenarios.map((details) => {
    return createTransaction("payment", account, {
      senderId: user.id,
      receiverId,
      ...details,
    });
  });
};

export const createRequest = (account: BankAccount, user: User) => {
  const requestScenarios: TransactionScenario[] = [
    {
      status: TransactionStatus.pending,
      requestStatus: "pending",
    },
    {
      status: TransactionStatus.incomplete,
      requestStatus: "pending",
    },
    {
      status: TransactionStatus.complete,
      requestStatus: "accepted",
    },
    {
      status: TransactionStatus.complete,
      requestStatus: "rejected",
    },
  ];

  const receiverId = getOtherRandomUser(user.id).id;

  return requestScenarios.map((details) => {
    return createTransaction("request", account, {
      senderId: user.id,
      receiverId,
      ...details,
    });
  });
};

const transactions = users.map((user: User): Transaction[][] => {
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
