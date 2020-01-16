export enum PaymentNotificationStatus {
  requested = "requested",
  received = "received",
  incomplete = "incomplete"
}

export interface PaymentNotification {
  id: string;
  uuid: string;
  status: PaymentNotificationStatus;
  transaction_id: string;
  is_read: boolean;
  created_at: Date;
  modified_at: Date;
}

export interface LikeNotification {
  id: string;
  uuid: string;
  like_id: string;
  transaction_id: string;
  is_read: boolean;
  created_at: Date;
  modified_at: Date;
}

export interface CommentNotification {
  id: string;
  uuid: string;
  comment_id: string;
  transaction_id: string;
  is_read: boolean;
  created_at: Date;
  modified_at: Date;
}
