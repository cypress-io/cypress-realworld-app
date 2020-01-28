import React from "react";
import { ListItemText, ListItem, Button } from "@material-ui/core";
import { TransactionResponseItem } from "../models";

type TransactionProps = {
  transaction: TransactionResponseItem;
  transactionLike: Function;
};

const TransactionItem: React.FC<TransactionProps> = ({
  transaction,
  transactionLike
}) => {
  // Payment
  /*if (transaction.) {

  }

  // Request
  if (transaction.requestStatus === "pending") {

  }*/

  return (
    <ListItem data-test={`transaction-${transaction.id}`}>
      <ListItemText primary={transaction.description} />
      <ListItemText primary={transaction.amount} />
      <ListItemText
        data-test={`transaction-like-count-${transaction.id}`}
        primary={transaction.likes ? transaction.likes.length : 0}
      />
      <Button
        size="small"
        onClick={() => transactionLike({ transactionId: transaction.id })}
        data-test={`transaction-like-${transaction.id}`}
      >
        Like
      </Button>
    </ListItem>
  );
};

export default TransactionItem;
