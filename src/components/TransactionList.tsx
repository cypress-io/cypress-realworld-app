import React from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import ListSkeleton from "./ListSkeleton";
import TransactionItem from "./TransactionItem";
import List from "@material-ui/core/List";
import { TransactionResponseItem } from "../models";

export interface TransactionListProps {
  header: string;
  transactions: TransactionResponseItem[];
  isLoading: Boolean;
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
  isLoading
}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        {header}
      </Typography>
      {isLoading && <ListSkeleton />}
      {transactions.length > 0 ? (
        <List data-test="transaction-list">
          {transactions.map(
            (transaction: TransactionResponseItem, index: number) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                transactionIndex={index}
              />
            )
          )}
        </List>
      ) : (
        <div>Empty State</div>
      )}
    </Paper>
  );
};

export default TransactionList;
