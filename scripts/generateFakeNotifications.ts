import fs from "fs";
import _ from "lodash";
import shortid from "shortid";
import faker from "faker";
import {
  getTransactionsForUserContacts,
  getLikesByTransactionId,
  getCommentsByTransactionId
} from "../src/backend/database";
import {
  User,
  PaymentNotification,
  PaymentNotificationStatus,
  NotificationType,
  LikeNotification,
  CommentNotification,
  Like,
  Comment
} from "../src/models";
import { users, getRandomTransactions } from "./utils";

export const createFakePaymentNotification = (
  user_id: string,
  transaction_id: string
): PaymentNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  user_id,
  transaction_id,
  status: faker.helpers.randomize([
    PaymentNotificationStatus.received,
    PaymentNotificationStatus.requested,
    PaymentNotificationStatus.incomplete
  ]),
  is_read: faker.helpers.randomize([true, false]),
  created_at: faker.date.past(),
  modified_at: faker.date.recent()
});

export const createFakeLikeNotification = (
  user_id: string,
  transaction_id: string,
  like_id: string
): LikeNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  user_id,
  like_id,
  transaction_id,
  is_read: faker.helpers.randomize([true, false]),
  created_at: faker.date.past(),
  modified_at: faker.date.recent()
});

export const createFakeCommentNotification = (
  user_id: string,
  transaction_id: string,
  comment_id: string
): CommentNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  user_id,
  comment_id,
  transaction_id,
  is_read: faker.helpers.randomize([true, false]),
  created_at: faker.date.past(),
  modified_at: faker.date.recent()
});

const notifications = users.flatMap((user: User): NotificationType[] => {
  const transactions = getTransactionsForUserContacts(user.id);

  // choose random transactions
  const randomTransactions = getRandomTransactions(5, transactions);

  // get a slice of random transactions
  const selectedTransactions = randomTransactions.slice(0, 2);

  // iterate over transactions and notification
  const transactionNotifications = selectedTransactions.map(transaction => {
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

  return _.flattenDeep(transactionNotifications);
});

fs.writeFile(
  __dirname + "/notifications.json",
  JSON.stringify(notifications),
  function() {
    console.log("notification records generated");
  }
);
