export enum LoanStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
  active = "active",
  completed = "completed",
}

export interface LoanTerms {
  amount: number;
  interestRate?: number;
  durationMonths: number;
}

export interface Loan {
  id: string;
  uuid: string;
  borrowerId: string;
  lenderId: string;
  terms: LoanTerms;
  status: LoanStatus;
  createdAt: Date;
  modifiedAt: Date;
}

export interface LoanPayload {
  toUserId: string;
  amount: number;
  interestRate?: number;
  durationMonths: number;
}

export interface LoanResponseItem extends Loan {
  borrowerName: string;
  lenderName: string;
  borrowerAvatar: string;
  lenderAvatar: string;
}
