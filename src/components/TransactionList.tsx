import React from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";

import TransactionItem from "./TransactionItem";
import List from "@material-ui/core/List";
import { TransactionResponseItem } from "../models";

export interface TransactionListProps {
  header: string;
  transactions: TransactionResponseItem[];
}

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: "95%"
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

const Animations = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
    </div>
  );
};

const TransactionList: React.FC<TransactionListProps> = ({
  header,
  transactions
}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        {header}
      </Typography>
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
        <Animations />
      )}
    </Paper>
  );
};

export default TransactionList;
