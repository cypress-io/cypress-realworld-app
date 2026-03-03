export type BankAccountData = {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
};

export const defaultBankAccountData: BankAccountData = {
  bankName: "The Best Bank",
  routingNumber: "987654321",
  accountNumber: "123456789",
};
