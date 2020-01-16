export interface Comment {
  id: string;
  uuid: string;
  content: string;
  user_id: string;
  transaction_id: string;
  created_at: Date;
  modified_at: Date;
}
