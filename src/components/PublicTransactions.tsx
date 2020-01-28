import React from "react";
import TransactionList from "./TransactionList";
import { TransactionResponseItem } from "../models";

type PublicTransactionsProps = {
  transactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
  transactionLike: Function;
};

const PublicTransactions: React.FC<PublicTransactionsProps> = ({
  transactions,
  transactionLike
}) => {
  return (
    <>
      <TransactionList
        header="Contacts"
        transactions={transactions.contacts}
        transactionLike={transactionLike}
      />
      <br />
      <TransactionList
        header="Public"
        transactions={transactions.public}
        transactionLike={transactionLike}
      />
    </>
  );
};

export default PublicTransactions;
