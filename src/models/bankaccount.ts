export interface BankAccount {
  id: string;
  uuid: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  is_deleted: boolean;
  created_at: Date;
  modified_at: Date;
}
