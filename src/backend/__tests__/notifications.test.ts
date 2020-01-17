import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  createPaymentNotification,
  createLikeNotification,
  createLike,
  createComment,
  createCommentNotification,
  getTransactionsByUserId,
  getNotificationsByUserId
} from "../database";

import { User, Transaction, PaymentNotificationStatus } from "../../models";

describe("Notifications", () => {
  let user: User;
  beforeEach(() => {
    user = getAllUsers()[0];
  });
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  describe("create notifications", () => {
    let transactions: Transaction[];
    let transaction: Transaction;
    beforeEach(() => {
      user = getAllUsers()[0];
      transactions = getTransactionsForUserContacts(user.id);
      transaction = transactions[0];
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
  });

  it("should get a list of notifications for a user", () => {
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    // create comment and like and notifications for transaction
    const comment = createComment(
      user.id,
      transaction.id,
      "This is my notification content"
    );
    createCommentNotification(user.id, transaction.id, comment.id);
    const like = createLike(user.id, transaction.id);
    createLikeNotification(user.id, transaction.id, like.id);

    const notifications = getNotificationsByUserId(user.id);

    expect(notifications.length).toBe(9);
    expect(notifications[8]).toMatchObject({ transaction_id: transaction.id });
  });
});
