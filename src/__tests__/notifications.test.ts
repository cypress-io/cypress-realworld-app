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
  getNotificationsByUserId,
  createNotifications,
  updateNotificationById,
  getNotificationById,
  formatNotificationForApiResponse,
} from "../../backend/database";

import {
  User,
  Transaction,
  PaymentNotificationStatus,
  PaymentNotification,
  Like,
  Comment,
  LikeNotification,
  CommentNotification,
  NotificationsType,
  NotificationType,
} from "../../src/models";

describe("Notifications", () => {
  let user: User;
  beforeEach(() => {
    seedDatabase();
    user = getAllUsers()[0];
  });

  describe("create notifications", () => {
    let transactions: Transaction[];
    let transaction: Transaction;
    let paymentNotification: PaymentNotification;
    let like: Like;
    let likeNotification: LikeNotification;
    let comment: Comment;
    let commentNotification: CommentNotification;
    beforeEach(() => {
      user = getAllUsers()[0];
      transactions = getTransactionsForUserContacts(user.id);
      transaction = transactions[0];
      paymentNotification = createPaymentNotification(
        user.id,
        transaction.id,
        PaymentNotificationStatus.received
      );
      like = createLike(user.id, transaction.id);
      likeNotification = createLikeNotification(user.id, transaction.id, like.id);
      comment = createComment(user.id, transaction.id, "This is my comment");

      commentNotification = createCommentNotification(user.id, transaction.id, comment.id);
    });

    it("should create a payment notification for a transaction", () => {
      expect(paymentNotification.transactionId).toBe(transaction.id);
      expect(paymentNotification.status).toBe(PaymentNotificationStatus.received);
    });

    it("should create a like notification for a transaction", () => {
      expect(likeNotification.transactionId).toBe(transaction.id);
      expect(likeNotification.likeId).toBe(like.id);
    });

    it("should create a comment notification for a transaction", () => {
      expect(commentNotification.transactionId).toBe(transaction.id);
      expect(commentNotification.commentId).toBe(comment.id);
    });

    it("should format comment notification for api", () => {
      const apiNotification = formatNotificationForApiResponse(commentNotification);
      expect(apiNotification.userFullName).toBeDefined();
    });

    it("should create notifications for a transaction", () => {
      const notificationsPayload = [
        {
          type: NotificationsType.payment,
          transactionId: transaction.id,
          status: PaymentNotificationStatus.received,
        },
        {
          type: NotificationsType.like,
          transactionId: transaction.id,
          likeId: like.id,
        },
        {
          type: NotificationsType.comment,
          transactionId: transaction.id,
          commentId: comment.id,
        },
      ];

      const notifications = createNotifications(user.id, notificationsPayload);

      expect(notifications[0]!.transactionId).toBe(transaction.id);
      // @ts-ignore
      expect(notifications[1]!.likeId).toBe(like.id);
      // @ts-ignore
      expect(notifications[2]!.commentId).toBe(comment.id);
    });
  });

  it("should get a list of notifications for a user", () => {
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    // create comment and like and notifications for transaction
    const comment = createComment(user.id, transaction.id, "This is my notification content");
    createCommentNotification(user.id, transaction.id, comment.id);
    const like = createLike(user.id, transaction.id);
    createLikeNotification(user.id, transaction.id, like.id);

    const notifications = getNotificationsByUserId(user.id);

    expect(notifications.length).toBeGreaterThan(1);
    expect(notifications[notifications.length - 1]).toMatchObject({
      transactionId: transaction.id,
    });
  });

  it("should update a notification", () => {
    const notifications = getNotificationsByUserId(user.id);
    const edits: Partial<NotificationType> = {
      isRead: true,
    };
    // @ts-ignore
    updateNotificationById(user.id, notifications[0].id, edits);

    // @ts-ignore
    const updatedNotification = getNotificationById(notifications[0].id);
    expect(updatedNotification.isRead).toBe(true);
  });
});
