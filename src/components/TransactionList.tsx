import React, { ReactNode } from "react";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";
import { Button, ListSubheader } from "@material-ui/core";
import { isEmpty } from "lodash/fp";

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
  filterComponent: ReactNode;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(1),
  },
}));

const TransactionList: React.FC<TransactionListProps> = ({
  header,
  transactions,
  isLoading,
  showCreateButton,
  loadNextPage,
  pagination,
  filterComponent,
}) => {
  const classes = useStyles();

  const showEmptyList = !isLoading && transactions?.length === 0;
  const showSkeleton = isLoading && isEmpty(pagination);

  return (
    <Paper className={classes.paper}>
      {filterComponent}
      <ListSubheader component="div">{header}</ListSubheader>
      {showSkeleton && <SkeletonList />}
      {transactions.length > 0 && (
        <TransactionInfiniteList
          transactions={transactions}
          loadNextPage={loadNextPage}
          pagination={pagination}
        />
      )}
      {showEmptyList && (
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
