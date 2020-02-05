export enum BankTransferType {
  withdrawal = "withdrawal",
  deposit = "deposit"
}
export interface BankTransfer {
  id: string;
  uuid: string;
  userId: string;
  source: string;
  amount: string;
  type: BankTransferType;
  transactionId: string;
  createdAt: Date;
  modifiedAt: Date;
}
