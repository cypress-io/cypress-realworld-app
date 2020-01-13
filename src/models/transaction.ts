import { DefaultPrivacyLevel } from "./user";
export enum TransactionStatus {
  "pending",
  "incomplete",
  "complete"
}

export enum RequestStatus {
  "pending",
  "accepted",
  "rejected"
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
  balance_at_completion: string;
  status: TransactionStatus;
  request_status: RequestStatus;
  request_resolved_at: Date;
  created_at: Date;
  modified_at: Date;
}
