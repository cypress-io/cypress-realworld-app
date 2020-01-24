import React from "react";
import { ListItemText, ListItem } from "@material-ui/core";
import { Transaction } from "../models";

type TransactionProps = {
  transaction: Transaction;
};

const TransactionItem: React.FC<TransactionProps> = ({ transaction }) => (
  <ListItem>
    <ListItemText primary={transaction.description} />
  </ListItem>
);

export default TransactionItem;
