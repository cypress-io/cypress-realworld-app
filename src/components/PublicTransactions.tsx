import React from "react";
import TransactionList from "./TransactionList";
import { TransactionResponseItem } from "../models";

type PublicTransactionsProps = {
  transactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
};

const PublicTransactions: React.FC<PublicTransactionsProps> = ({
  transactions
}) => {
  return (
    <>
      <TransactionList header="Contacts" transactions={transactions.contacts} />
      <br />
      <TransactionList header="Public" transactions={transactions.public} />
    </>
  );
};

export default PublicTransactions;
