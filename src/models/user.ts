export enum DefaultPrivacyLevel {
  "public",
  "private",
  "contacts"
}

export interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email: string;
  phone_number: string;
  balance: number;
  avatar: string;
  default_privacy_level: DefaultPrivacyLevel;
  created_at: Date;
  modified_at: Date;
}
