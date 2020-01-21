import React from "react";
import { ListItemText, ListItem } from "@material-ui/core";

interface Transaction {
  id: number;
  to: string;
  from: string;
  amount: number;
}

type TransactionProps = {
  transaction: Transaction;
};

const TransactionCard: React.FC<TransactionProps> = ({ transaction }) => (
  <ListItem>
    <ListItemText primary="Test Item" />
  </ListItem>
);

export default TransactionCard;
