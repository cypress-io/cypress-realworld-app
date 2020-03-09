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

  console.log("pagination", pagination);
  const loadMoreItems = (startIndex: number, stopIndex: number) => {
    console.log("loadmore items");
    if (pagination.hasNextPages) {
      console.log("hasnext pages");
      return Promise.resolve("").then(() => {
        console.log("loading next page");
        loadNextPage("FETCH", { page: pagination.page + 1 });
      });
    }

    return null;
  };

  const isItemLoaded = (index: number) => {
    return !pagination.hasNextPages || index < transactions.length;
  };

  // Render a list item or a loading indicator.
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
      threshold={pagination.limit}
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
