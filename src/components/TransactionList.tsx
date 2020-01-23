import React from "react";
import Typography from "@material-ui/core/Typography";
import TransactionItem from "./TransactionItem";
import List from "@material-ui/core/List";
import { Transaction } from "../models";

export interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => (
  <>
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      Recent Transactions
    </Typography>
    <List data-test="transaction-list">
      {transactions.map((i: any) => (
        <TransactionItem transaction={i} />
      ))}
    </List>
  </>
);

export default TransactionList;
