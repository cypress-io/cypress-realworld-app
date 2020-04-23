/* eslint-disable import/first */
require("dotenv").config();

import path from "path";
import fs from "fs";
import shortid from "shortid";
import faker from "faker";
import bcrypt from "bcryptjs";
import {
  __,
  map,
  flattenDeep,
  times,
  concat,
  sample,
  reject,
  uniq,
  flow,
  set,
  get,
  update,
  tap,
  curry,
  pick,
  identity,
  over,
  assign,
  zip,
  fromPairs,
  zipObject,
  merge,
  setWith,
  tail,
  assignWith,
  toPairs,
  head,
  mergeWith,
  assignIn,
} from "lodash/fp";
import {
  BankAccount,
  User,
  DefaultPrivacyLevel,
  Like,
  Comment,
  PaymentNotification,
  PaymentNotificationStatus,
  NotificationType,
  LikeNotification,
  CommentNotification,
  Transaction,
  TransactionStatus,
  TransactionRequestStatus,
  TransactionScenario,
  FakeTransaction,
} from "../src/models";
import {
  getTransactionsForUserContacts,
  getLikesByTransactionId,
  getCommentsByTransactionId,
  getBankAccountsByUserId,
  TDatabase,
  createContactForUser,
} from "../backend/database";
import { getFakeAmount } from "../src/utils/transactionUtils";

const userbaseSize = process.env.SEED_USERBASE_SIZE;
const paymentsPerUser = process.env.SEED_PAYMENTS_PER_USER;
const requestsPerUser = process.env.SEED_REQUESTS_PER_USER;

const isPayment = (type: string) => type === "payment";
const passwordHash = bcrypt.hashSync("s3cret", 10);

export const getRandomTransactions = (
  baseCount: number,
  baseTransactions: Transaction[]
) =>
  uniq(
    Array(baseCount)
      .fill(null)
      .map(() => sample(baseTransactions))
  );

const createFakeUser = (): User => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName(),
  password: passwordHash,
  email: faker.internet.email(),
  phoneNumber: faker.phone.phoneNumber(),
  avatar: faker.internet.avatar(),
  defaultPrivacyLevel: faker.helpers.randomize([
    DefaultPrivacyLevel.public,
    DefaultPrivacyLevel.private,
    DefaultPrivacyLevel.contacts,
  ]),
  balance: faker.random.number(),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

// @ts-ignore
const createSeedUsers = () => times(() => createFakeUser(), userbaseSize);

const createContact = (userId: User["id"], contactUserId: User["id"]) => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  contactUserId,
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

// returns a random user other than the one passed in
const getOtherRandomUser = curry(
  (seedUsers: User[], userId: User["id"]): User =>
    flow(reject(["id", userId]), sample)(seedUsers)
);

const randomContactsForUser = curry((seedUsers: User[], user: User) =>
  times(() => getOtherRandomUser(seedUsers, user.id), 3)
);
const generateRandomContactsForUser = (seedUsers: User[]) =>
  map((user: User) => ({
    userId: user.id,
    contacts: randomContactsForUser(seedUsers, user),
  }))(seedUsers);

const createContactsForUser = curry((randomContacts: any) =>
  flattenDeep(
    map((item: any) =>
      map((contact: User) => createContact(item.userId, contact.id))(
        item.contacts
      )
    )(randomContacts)
  )
);

const createSeedContacts = (seedUsers: User[]) => {
  return flow(generateRandomContactsForUser, createContactsForUser)(seedUsers);
};

const createSeedBankAccounts = (seedUsers: User[]) =>
  map(
    (user: User): BankAccount => {
      return {
        id: shortid(),
        uuid: faker.random.uuid(),
        userId: user.id,
        bankName: `${faker.company.companyName()} Bank`,
        accountNumber: faker.finance.account(10),
        routingNumber: faker.finance.account(9),
        isDeleted: faker.helpers.randomize([true, false]),
        createdAt: faker.date.past(),
        modifiedAt: faker.date.recent(),
      };
    }
  )(seedUsers);

export const buildDatabase = () => {
  const seedUsers = createSeedUsers();
  const seedContacts = createSeedContacts(seedUsers);
  const seedBankAccounts = createSeedBankAccounts(seedUsers);

  return {
    users: seedUsers,
    contacts: seedContacts,
    bankaccounts: seedBankAccounts,
    transactions: [],
    likes: [],
    comments: [],
    notifications: [],
    banktransfers: [],
  };
};

/*
// TRANSACTIONS

const seedTransactions: Transaction[] = flattenDeep(transactions);

const createFakeLike = (userId: string, transactionId: string): Like => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  transactionId,
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

const seedLikes = seedUsers.map((user: User): Like[] => {
  const transactions = getTransactionsForUserContacts(user.id);

  // choose random transactions
  const randomTransactions = getRandomTransactions(5, transactions);

  // get a slice of random transactions
  const selectedTransactions = randomTransactions.slice(0, 2);

  // iterate over transactions and like
  return selectedTransactions.map((transaction) =>
    createFakeLike(user.id, transaction!.id)
  );
});

export const createFakeComment = (
  userId: string,
  transactionId: string
): Comment => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  content: faker.lorem.words(),
  userId,
  transactionId,
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

const seedComments = seedUsers.flatMap((user: User): Comment[] => {
  const transactions = getTransactionsForUserContacts(user.id);

  // choose random transactions
  const randomTransactions = getRandomTransactions(5, transactions);

  // get a slice of random transactions
  const selectedTransactions = randomTransactions.slice(0, 2);

  // iterate over transactions and comment
  return selectedTransactions.map((transaction) =>
    createFakeComment(user.id, transaction!.id)
  );
});

const createFakePaymentNotification = (
  userId: string,
  transactionId: string
): PaymentNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  transactionId,
  status: faker.helpers.randomize([
    PaymentNotificationStatus.received,
    PaymentNotificationStatus.requested,
    PaymentNotificationStatus.incomplete,
  ]),
  isRead: faker.helpers.randomize([true, false]),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

const createFakeLikeNotification = (
  userId: string,
  transactionId: string,
  likeId: string
): LikeNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  likeId,
  transactionId,
  isRead: faker.helpers.randomize([true, false]),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

const createFakeCommentNotification = (
  userId: string,
  transactionId: string,
  commentId: string
): CommentNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  commentId,
  transactionId,
  isRead: faker.helpers.randomize([true, false]),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

const seedNotifications = seedUsers.flatMap(
  (user: User): NotificationType[] => {
    const transactions = getTransactionsForUserContacts(user.id);

    // choose random transactions
    const randomTransactions = getRandomTransactions(5, transactions);

    // get a slice of random transactions
    const selectedTransactions = randomTransactions.slice(0, 2);

    // iterate over transactions and notification
    const transactionNotifications = selectedTransactions.map((transaction) => {
      const likes = getLikesByTransactionId(transaction!.id);
      const comments = getCommentsByTransactionId(transaction!.id);

      let allNotifications = [];

      // payment notification
      allNotifications.push(
        createFakePaymentNotification(user.id, transaction!.id)
      );

      // like notifications
      const likeNotifications = likes.map((like: Like) =>
        createFakeLikeNotification(user.id, transaction!.id, like!.id)
      );

      // comment notifications
      const commentNotifications = comments.map((comment: Comment) =>
        createFakeCommentNotification(user.id, transaction!.id, comment!.id)
      );

      return [allNotifications, likeNotifications, commentNotifications];
    });

    return flattenDeep(transactionNotifications);
  }
);

const testSeed = {
  users: seedUsers,
  contacts: seedContacts,
  bankcaccounts: seedBankAccounts,
  likes: seedLikes,
  comments: seedComments,
  notifications: seedNotifications,
  transactions: seedTransactions,
};

const fileData = JSON.stringify(testSeed, null, 2);
console.log("data:", fileData);
fs.writeFile(
  path.join(process.cwd(), "data", "test-seed.json"),
  fileData,
  (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("test seed generated");
  }
);

*/
