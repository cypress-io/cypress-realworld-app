import React from "react";
import { get } from "lodash/fp";
import { useTheme, useMediaQuery, Divider } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
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
  const isXsBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  const removePx = (str: string) => +str.slice(0, str.length - 2);

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
            height={isXsBreakpoint ? removePx(theme.spacing(74)) : removePx(theme.spacing(88))}
            width={isXsBreakpoint ? removePx(theme.spacing(38)) : removePx(theme.spacing(90))}
            rowHeight={isXsBreakpoint ? removePx(theme.spacing(28)) : removePx(theme.spacing(16))}
            rowRenderer={rowRenderer}
          />
        </div>
      )}
    </InfiniteLoader>
  );
};

export default TransactionInfiniteList;
