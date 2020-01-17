import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  //getTransactionsByUserId,
  createPaymentNotification,
  createLikeNotification,
  createLike,
  createComment,
  createCommentNotification
  //getNotificationsByUserId,
  //createComment,
  //createLike
} from "../database";

import { User, Transaction, PaymentNotificationStatus } from "../../models";

describe("Notifications", () => {
  let user: User;
  let transactions: Transaction[];
  let transaction: Transaction;
  beforeEach(() => {
    user = getAllUsers()[0];
    transactions = getTransactionsForUserContacts(user.id);
    transaction = transactions[0];
  });
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it("should create a payment notification for a transaction", () => {
    const notification = createPaymentNotification(
      user.id,
      transaction.id,
      PaymentNotificationStatus.received
    );

    expect(notification.transaction_id).toBe(transaction.id);
    expect(notification.status).toBe(PaymentNotificationStatus.received);
  });

  it("should create a like notification for a transaction", () => {
    const like = createLike(user.id, transaction.id);

    const notification = createLikeNotification(
      user.id,
      transaction.id,
      like.id
    );

    expect(notification.transaction_id).toBe(transaction.id);
    expect(notification.like_id).toBe(like.id);
  });

  it("should create a comment notification for a transaction", () => {
    const comment = createComment(
      user.id,
      transaction.id,
      "This is my comment"
    );

    const notification = createCommentNotification(
      user.id,
      transaction.id,
      comment.id
    );

    expect(notification.transaction_id).toBe(transaction.id);
    expect(notification.comment_id).toBe(comment.id);
  });

  /*
  it("should get a list of notifications for a user", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    // create notifications for transaction
    createComment(user.id, transaction.id, "This is my notification content");
    createLike(user.id, transaction.id);

    const notifications = getNotificationsByUserId(user.id);

    expect(notifications.length).toBe(2);
    expect(notifications[0].transaction_id).toBe(transaction.id);
  });
  */
});
