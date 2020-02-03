export enum TransferType {
  withdrawal = "withdrawal",
  deposit = "deposit"
}
export interface BankTransfer {
  id: string;
  uuid: string;
  userId: string;
  source: string;
  amount: string;
  type: TransferType;
  transactionId: string;
  createdAt: Date;
  modifiedAt: Date;
}
