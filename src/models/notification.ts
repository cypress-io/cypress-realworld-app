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
  user_id: string;
  status: PaymentNotificationStatus;
  transaction_id: string;
  is_read: boolean;
  created_at: Date;
  modified_at: Date;
}

export interface LikeNotification {
  id: string;
  uuid: string;
  user_id: string;
  like_id: string;
  transaction_id: string;
  is_read: boolean;
  created_at: Date;
  modified_at: Date;
}

export interface CommentNotification {
  id: string;
  uuid: string;
  user_id: string;
  comment_id: string;
  transaction_id: string;
  is_read: boolean;
  created_at: Date;
  modified_at: Date;
}

export interface PaymentNotificationPayload {
  type: NotificationsType;
  transaction_id: string;
  status: PaymentNotificationStatus;
}

export interface LikeNotificationPayload {
  type: NotificationsType;
  transaction_id: string;
  like_id: string;
}

export interface CommentNotificationPayload {
  type: NotificationsType;
  transaction_id: string;
  comment_id: string;
}

export type NotificationType =
  | PaymentNotification
  | LikeNotification
  | CommentNotification;

export type NotificationPayloadType = PaymentNotificationPayload &
  LikeNotificationPayload &
  CommentNotificationPayload;
