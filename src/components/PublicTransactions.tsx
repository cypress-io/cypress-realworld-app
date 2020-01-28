import React from "react";
import TransactionList from "./TransactionList";
import { TransactionResponseItem } from "../models";

type PublicTransactionsProps = {
  transactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
  transactionLike: Function;
  transactionComment: Function;
};

const PublicTransactions: React.FC<PublicTransactionsProps> = ({
  transactions,
  transactionLike,
  transactionComment
}) => {
  return (
    <>
      <TransactionList
        header="Contacts"
        transactions={transactions.contacts}
        transactionLike={transactionLike}
        transactionComment={transactionComment}
      />
      <br />
      <TransactionList
        header="Public"
        transactions={transactions.public}
        transactionLike={transactionLike}
        transactionComment={transactionComment}
      />
    </>
  );
};

export default PublicTransactions;
