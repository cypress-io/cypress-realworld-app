export enum PaymentNotificationStatus {
  requested = "requested",
  received = "received",
  incomplete = "incomplete"
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

export type NotificationType =
  | PaymentNotification
  | LikeNotification
  | CommentNotification;
