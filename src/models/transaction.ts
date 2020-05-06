import { DefaultPrivacyLevel } from "./user";
import { Like, Comment } from ".";

export enum TransactionStatus {
  pending = "pending",
  incomplete = "incomplete",
  complete = "complete",
}

export enum TransactionRequestStatus {
  pending = "pending",
  accepted = "accepted",
  rejected = "rejected",
}

export interface Transaction {
  id: string;
  uuid: string;
  source: string; // Empty if Payment or Request; Populated with BankAccount ID
  amount: number;
  description: string;
  privacyLevel: DefaultPrivacyLevel;
  receiverId: string;
  senderId: string;
  balanceAtCompletion?: number;
  status: TransactionStatus;
  requestStatus?: TransactionRequestStatus | string;
  requestResolvedAt?: Date | string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface FakeTransaction {
  id?: string;
  uuid?: string;
  source?: string; // Empty if Payment or Request; Populated with BankAccount ID
  amount?: number;
  description?: string;
  privacyLevel?: DefaultPrivacyLevel;
  receiverId: string;
  senderId: string;
  balanceAtCompletion?: number;
  status?: TransactionStatus;
  requestStatus?: TransactionRequestStatus | string;
  requestResolvedAt?: Date | string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface TransactionResponseItem extends Transaction {
  likes: Like[];
  comments: Comment[];
  receiverName: string;
  receiverAvatar: string;
  senderName: string;
  senderAvatar: string;
}

export type TransactionScenario = {
  status: TransactionStatus;
  requestStatus: TransactionRequestStatus | string;
};

export type TransactionPayload = Omit<Transaction, "id" | "uuid" | "createdAt" | "modifiedAt">;

export type TransactionCreatePayload = Partial<
  Pick<Transaction, "senderId" | "receiverId" | "description"> & {
    amount: string;
    transactionType: string;
  }
>;

export type TransactionUpdateActionPayload = Pick<Transaction, "id" | "requestStatus">;

type TransactionQueryBase = {
  dateRangeStart?: string;
  dateRangeEnd?: string;
  amountMin?: number;
  amountMax?: number;
  status?: TransactionStatus;
  limit?: number;
  page?: number;
};

export type TransactionQueryPayload = Partial<TransactionQueryBase>;

export type TransactionDateRangePayload = Partial<
  Pick<TransactionQueryPayload, "dateRangeStart" | "dateRangeEnd">
>;

export type TransactionAmountRangePayload = Partial<
  Pick<TransactionQueryPayload, "amountMin" | "amountMax">
>;

export type TransactionPaginationPayload = Partial<Pick<TransactionQueryPayload, "page" | "limit">>;

export type TransactionClearFiltersPayload = {
  filterType: "date" | "amount";
};

export type TransactionPagination = {
  page: number;
  limit: number;
  hasNextPages: boolean;
  totalPages: number;
};
