import React from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@material-ui/core";

import SkeletonList from "./SkeletonList";
import { TransactionResponseItem, TransactionPagination } from "../models";
import EmptyList from "./EmptyList";
import TransactionInfiniteList from "./TransactionInfiniteList";

export interface TransactionListProps {
  header: string;
  transactions: TransactionResponseItem[];
  isLoading: Boolean;
  showCreateButton?: Boolean;
  loadNextPage: Function;
  pagination: TransactionPagination;
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
  isLoading,
  showCreateButton,
  loadNextPage,
  pagination
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        {header}
      </Typography>
      {/* isLoading && pagination.page <= 1 && <SkeletonList /> */}
      {transactions.length > 0 ? (
        <TransactionInfiniteList
          transactions={transactions}
          loadNextPage={loadNextPage}
          pagination={pagination}
        />
      ) : (
        <EmptyList entity="Transactions">
          {showCreateButton && (
            <Button
              data-test="transaction-list-empty-create-transaction-button"
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/transaction/new"
            >
              Create A Transaction
            </Button>
          )}
        </EmptyList>
      )}
    </Paper>
  );
};

export default TransactionList;
