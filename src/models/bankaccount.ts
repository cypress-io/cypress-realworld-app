export interface BankAccount {
  id: string;
  uuid: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  isDeleted: boolean;
  createdAt: Date;
  modifiedAt: Date;
}
