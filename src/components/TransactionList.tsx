import React from "react";
import Typography from "@material-ui/core/Typography";
import TransactionItem from "./TransactionItem";
import List from "@material-ui/core/List";
import { TransactionResponseItem } from "../models";

export interface TransactionListProps {
  transactions: TransactionResponseItem[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => (
  <>
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      Recent Transactions
    </Typography>
    <List data-test="transaction-list">
      {transactions &&
        transactions.map((i: any) => (
          <TransactionItem key={i.id} transaction={i} />
        ))}
    </List>
  </>
);

export default TransactionList;
