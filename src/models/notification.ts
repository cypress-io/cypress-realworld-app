export enum PaymentNotificationStatus {
  requested = "requested",
  received = "received",
  incomplete = "incomplete",
}

export enum NotificationsType {
  payment = "payment",
  like = "like",
  comment = "comment",
}

export interface NotificationBase {
  id: string;
  uuid: string;
  userId: string;
  transactionId: string;
  isRead: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export type NotificationUpdatePayload = Partial<Pick<NotificationBase, "id" | "isRead">>;

export interface PaymentNotification extends NotificationBase {
  status: PaymentNotificationStatus;
}

export interface LikeNotification extends NotificationBase {
  likeId: string;
}

export interface CommentNotification extends NotificationBase {
  commentId: string;
}

export interface PaymentNotificationResponseItem extends PaymentNotification {
  userFullName: string;
}

export interface CommentNotificationResponseItem extends CommentNotification {
  userFullName: string;
}

export interface LikeNotificationResponseItem extends LikeNotification {
  userFullName: string;
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

export type NotificationType = PaymentNotification | LikeNotification | CommentNotification;

export type NotificationPayloadType =
  | PaymentNotificationPayload
  | LikeNotificationPayload
  | CommentNotificationPayload;

export type NotificationResponseItem =
  | PaymentNotificationResponseItem
  | LikeNotificationResponseItem
  | CommentNotificationResponseItem;
