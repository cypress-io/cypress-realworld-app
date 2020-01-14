import { DefaultPrivacyLevel } from "./user";
export enum TransactionStatus {
  pending = "pending",
  incomplete = "incomplete",
  complete = "complete"
}

export enum RequestStatus {
  pending = "pending",
  accepted = "accepted",
  rejected = "rejected"
}

export interface Transaction {
  id: string;
  uuid: string;
  source: string;
  amount: string;
  description: string;
  privacy_level: DefaultPrivacyLevel;
  receiver_id: string;
  sender_id: string;
  balance_at_completion?: string;
  status: TransactionStatus;
  request_status?: RequestStatus;
  request_resolved_at?: Date;
  created_at: Date;
  modified_at: Date;
}
