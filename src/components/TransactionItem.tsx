import React from "react";
import { ListItemText, ListItem } from "@material-ui/core";
import { TransactionResponseItem } from "../models";

type TransactionProps = {
  transaction: TransactionResponseItem;
};

const TransactionItem: React.FC<TransactionProps> = ({ transaction }) => {
  // Payment
  /*if (transaction.) {

  }

  // Request
  if (transaction.requestStatus === "pending") {

  }*/

  return (
    <ListItem>
      <ListItemText primary={transaction.description} />
      <ListItemText primary={transaction.amount} />
    </ListItem>
  );
};

export default TransactionItem;
