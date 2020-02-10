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

export interface NotificationBase {
  id: string;
  uuid: string;
  userId: string;
  userFullName: string;
  transactionId: string;
  isRead: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface PaymentNotification extends NotificationBase {
  status: PaymentNotificationStatus;
}

export interface LikeNotification extends NotificationBase {
  likeId: string;
}

export interface CommentNotification extends NotificationBase {
  commentId: string;
}

export interface NotificationPayloadBase {
  type: NotificationsType;
  transactionId: string;
}

export interface PaymentNotificationPayload extends NotificationPayloadBase {
  status: PaymentNotificationStatus;
}

export interface LikeNotificationPayload extends NotificationPayloadBase {
  likeId: string;
}

export interface CommentNotificationPayload extends NotificationPayloadBase {
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
