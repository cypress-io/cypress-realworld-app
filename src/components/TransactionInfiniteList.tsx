import React from "react";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList } from "react-window";

import TransactionItem from "./TransactionItem";
import { TransactionResponseItem, TransactionPagination } from "../models";
import { get } from "lodash/fp";

export interface TransactionListProps {
  transactions: TransactionResponseItem[];
  loadNextPage: Function;
  pagination: TransactionPagination;
}

const TransactionInfiniteList: React.FC<TransactionListProps> = ({
  transactions,
  loadNextPage,
  pagination
}) => {
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
      return <div style={style}>Loading...</div>;
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
        <FixedSizeList
          data-test="transaction-list"
          itemCount={itemCount}
          ref={ref}
          onItemsRendered={onItemsRendered}
          height={500}
          width={850}
          itemSize={198}
        >
          {Item}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
};

export default TransactionInfiniteList;
