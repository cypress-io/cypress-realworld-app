import React, { useState } from "react";
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
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);

  const itemCount = pagination.hasNextPages
    ? transactions.length + 1
    : transactions.length;

  const loadMoreItems = (startIndex: number, stopIndex: number) => {
    console.log({ startIndex });
    console.log({ stopIndex });
    if (pagination.hasNextPages) {
      return Promise.resolve("TEST").then(() => {
        console.log("load next page");

        setIsNextPageLoading(true);
        loadNextPage({ page: pagination.page + 1 });
      });
    }
  };

  // Every row is loaded except for our loading indicator row.
  //const isItemLoaded = ({ index }: { index: number }) => !hasNextPage || index < transactions.length;
  const isItemLoaded = (index: number) => {
    /*console.log("ItemLoaded hasNextPage: ", hasNextPage);
    console.log("ItemLoaded Index: ", index);
    console.log("ItemLoaded transactions.length : ", transactions.length);*/
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
      // @ts-ignore
      loadMoreItems={loadMoreItems}
      itemCount={itemCount}
      threshold={pagination.limit}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          data-test="transaction-list"
          itemCount={transactions.length}
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
