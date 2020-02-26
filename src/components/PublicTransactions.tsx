import React from "react";
import TransactionList from "./TransactionList";
import { TransactionResponseItem } from "../models";

type PublicTransactionsProps = {
  isLoading: Boolean;
  transactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
};

const PublicTransactions: React.FC<PublicTransactionsProps> = ({
  transactions,
  isLoading
}) => {
  return (
    <>
      <TransactionList
        header="Contacts"
        transactions={transactions.contacts}
        isLoading={isLoading}
      />
      <br />
      <TransactionList
        header="Public"
        transactions={transactions.public}
        isLoading={isLoading}
      />
    </>
  );
};

export default PublicTransactions;
