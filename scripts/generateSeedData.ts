/* eslint-disable import/first */
require("dotenv").config();

import path from "path";
import fs from "fs";
import shortid from "shortid";
import faker from "faker";
import bcrypt from "bcryptjs";
import { flattenDeep } from "lodash";
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
} from "../src/models";
import { getOtherRandomUser, getRandomTransactions } from "./utils";
import {
  getTransactionsForUserContacts,
  getLikesByTransactionId,
  getCommentsByTransactionId,
} from "../src/backend/database";

const passwordHash = bcrypt.hashSync("s3cret", 10);

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

const seedUsers = Array(10).fill(null).map(createFakeUser);

const contacts = seedUsers.map((user: User) => {
  return Array(3)
    .fill(null)
    .map(() => ({
      id: shortid(),
      uuid: faker.random.uuid(),
      userId: user.id,
      contactUserId: getOtherRandomUser(user.id).id,
      createdAt: faker.date.past(),
      modifiedAt: faker.date.recent(),
    }));
});

const seedContacts = flattenDeep(contacts);

const seedBankAccounts = seedUsers.map(
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
      modifiedAt: faker.date.recent(),
    };
  }
);

// TRANSACTIONS
const seedTransactions: Transaction[] = [];

const createFakeLike = (userId: string, transactionId: string): Like => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  transactionId,
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

const seedLikes = seedUsers.flatMap((user: User): Like[] => {
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

fs.writeFile(
  path.join(process.cwd(), "../src/data", "test-seed.json"),
  JSON.stringify(testSeed),
  function () {
    console.log("notification records generated");
  }
);
