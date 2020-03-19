import React from "react";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList } from "react-window";
import { get } from "lodash/fp";
import { useTheme, makeStyles } from "@material-ui/core/styles";

import TransactionItem from "./TransactionItem";
import { TransactionResponseItem, TransactionPagination } from "../models";
import { useMediaQuery } from "@material-ui/core";

export interface TransactionListProps {
  transactions: TransactionResponseItem[];
  loadNextPage: Function;
  pagination: TransactionPagination;
}

const useStyles = makeStyles(theme => ({
  transactionList: {
    minHeight: theme.spacing(80),
    [theme.breakpoints.down("sm")]: {
      minHeight: theme.spacing(60)
    },
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

const TransactionInfiniteList: React.FC<TransactionListProps> = ({
  transactions,
  loadNextPage,
  pagination
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const itemCount = pagination.hasNextPages
    ? transactions.length + 1
    : transactions.length;

  const loadMoreItems = () =>
    Promise.resolve("").then(
      () => pagination.hasNextPages && loadNextPage(pagination.page + 1)
    );

  const isItemLoaded = (index: number) =>
    !pagination.hasNextPages || index < transactions.length;

  const Item = ({ index, style }: { index: number; style: any }) => {
    if (!isItemLoaded(index)) {
      return (
        <div data-test="transaction-loading" style={style}>
          Loading...
        </div>
      );
    } else {
      const transaction = get(index, transactions);
      return (
        <div style={style}>
          <TransactionItem transaction={transaction} transactionIndex={index} />
        </div>
      );
    }
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      loadMoreItems={loadMoreItems}
      itemCount={itemCount}
      threshold={2}
    >
      {({ onItemsRendered, ref }) => (
        <div data-test="transaction-list" className={classes.transactionList}>
          <FixedSizeList
            itemCount={itemCount}
            ref={ref}
            onItemsRendered={onItemsRendered}
            height={isMobile ? theme.spacing(78) : theme.spacing(72)}
            width={isMobile ? theme.spacing(36.5) : theme.spacing(106.25)}
            itemSize={isMobile ? theme.spacing(40) : theme.spacing(24.75)}
          >
            {Item}
          </FixedSizeList>
        </div>
      )}
    </InfiniteLoader>
  );
};

export default TransactionInfiniteList;
