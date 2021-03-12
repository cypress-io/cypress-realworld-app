import React from "react";
import { get } from "lodash/fp";
import { useTheme, makeStyles, useMediaQuery, Divider } from "@material-ui/core";
import { InfiniteLoader, List, Index } from "react-virtualized";
import "react-virtualized/styles.css"; // only needs to be imported once

import TransactionItem from "./TransactionItem";
import { TransactionResponseItem, TransactionPagination } from "../models";

export interface TransactionListProps {
  transactions: TransactionResponseItem[];
  loadNextPage: Function;
  pagination: TransactionPagination;
}

const useStyles = makeStyles((theme) => ({
  transactionList: {
    width: "100%",
    minHeight: "80vh",
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const TransactionInfiniteList: React.FC<TransactionListProps> = ({
  transactions,
  loadNextPage,
  pagination,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isXsBreakpoint = useMediaQuery(theme.breakpoints.down("xs"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const itemCount = pagination.hasNextPages ? transactions.length + 1 : transactions.length;

  const loadMoreItems = () => {
    return new Promise((resolve) => {
      return resolve(pagination.hasNextPages && loadNextPage(pagination.page + 1));
    });
  };

  const isRowLoaded = (params: Index) =>
    !pagination.hasNextPages || params.index < transactions.length;

  // @ts-ignore
  function rowRenderer({ key, index, style }) {
    const transaction = get(index, transactions);

    if (index < transactions.length) {
      return (
        <div key={key} style={style}>
          <TransactionItem transaction={transaction} />
          <Divider variant={isMobile ? "fullWidth" : "inset"} />
        </div>
      );
    }
  }

  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={loadMoreItems}
      rowCount={itemCount}
      threshold={2}
    >
      {({ onRowsRendered, registerChild }) => (
        <div data-test="transaction-list" className={classes.transactionList}>
          <List
            rowCount={itemCount}
            ref={registerChild}
            onRowsRendered={onRowsRendered}
            height={isXsBreakpoint ? theme.spacing(74) : theme.spacing(88)}
            width={isXsBreakpoint ? theme.spacing(38) : theme.spacing(110)}
            rowHeight={isXsBreakpoint ? theme.spacing(28) : theme.spacing(16)}
            rowRenderer={rowRenderer}
          />
        </div>
      )}
    </InfiniteLoader>
  );
};

export default TransactionInfiniteList;
