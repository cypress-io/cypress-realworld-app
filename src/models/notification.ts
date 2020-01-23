export enum PaymentNotificationStatus {
  requested = "requested",
  received = "received",
  incomplete = "incomplete"
}

export enum NotificationsType {
  payment = "payment",
  like = "like",
  comment = "comment"
}

export interface PaymentNotification {
  id: string;
  uuid: string;
  userId: string;
  status: PaymentNotificationStatus;
  transactionId: string;
  isRead: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface LikeNotification {
  id: string;
  uuid: string;
  userId: string;
  likeId: string;
  transactionId: string;
  isRead: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface CommentNotification {
  id: string;
  uuid: string;
  userId: string;
  commentId: string;
  transactionId: string;
  isRead: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface PaymentNotificationPayload {
  type: NotificationsType;
  transactionId: string;
  status: PaymentNotificationStatus;
}

export interface LikeNotificationPayload {
  type: NotificationsType;
  transactionId: string;
  likeId: string;
}

export interface CommentNotificationPayload {
  type: NotificationsType;
  transactionId: string;
  commentId: string;
}

export type NotificationType =
  | PaymentNotification
  | LikeNotification
  | CommentNotification;

export type NotificationPayloadType =
  | PaymentNotificationPayload
  | LikeNotificationPayload
  | CommentNotificationPayload;
