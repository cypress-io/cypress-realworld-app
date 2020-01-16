import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  //getTransactionsByUserId,
  createPaymentNotification
  //getNotificationsByUserId,
  //createComment,
  //createLike
} from "../database";

import { User, Transaction, PaymentNotificationStatus } from "../../models";

describe("Notifications", () => {
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it("should create a payment notification for a transaction", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

    const notification = createPaymentNotification(
      user.id,
      transactions[0].id,
      PaymentNotificationStatus.received
    );

    expect(notification.transaction_id).toBe(transactions[0].id);
    expect(notification.status).toBe(PaymentNotificationStatus.received);
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
