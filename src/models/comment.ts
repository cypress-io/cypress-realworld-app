export interface Comment {
  id: string;
  uuid: string;
  content: string;
  userId: string;
  transactionId: string;
  createdAt: Date;
  modifiedAt: Date;
}
