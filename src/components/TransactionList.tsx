import React from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TransactionItem from "./TransactionItem";
import List from "@material-ui/core/List";
import { TransactionResponseItem } from "../models";

export interface TransactionListProps {
  header: string;
  transactions: TransactionResponseItem[];
  transactionLike: Function;
  transactionComment: Function;
}

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

const TransactionList: React.FC<TransactionListProps> = ({
  header,
  transactions,
  transactionLike,
  transactionComment
}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        {header}
      </Typography>
      <List data-test="transaction-list">
        {transactions &&
          transactions.map((i: any) => (
            <TransactionItem
              key={i.id}
              transaction={i}
              transactionLike={transactionLike}
              transactionComment={transactionComment}
            />
          ))}
      </List>
    </Paper>
  );
};

export default TransactionList;
