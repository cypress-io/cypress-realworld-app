import React, { useState } from "react";
import InfiniteLoader from "react-window-infinite-loader";
import { VariableSizeList } from "react-window";

import TransactionItem from "./TransactionItem";
import { TransactionResponseItem } from "../models";
import { get } from "lodash/fp";

export interface TransactionListProps {
  transactions: TransactionResponseItem[];
  loadNextPage: Function;
}

const TransactionInfiniteList: React.FC<TransactionListProps> = ({
  transactions,
  loadNextPage
}) => {
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const itemCount = hasNextPage ? transactions.length + 1 : transactions.length;

  const loadMoreItems = (startIndex: number, stopIndex: number) => {
    console.log({ startIndex });
    console.log({ stopIndex });
    if (startIndex === 10) {
      return Promise.resolve("TEST").then(() => {
        console.log("load next page");

        setIsNextPageLoading(true);
        setHasNextPage(false);
        loadNextPage({ page: 2 });
      });
    }
  };

  // Every row is loaded except for our loading indicator row.
  //const isItemLoaded = ({ index }: { index: number }) => !hasNextPage || index < transactions.length;
  const isItemLoaded = (index: number) => {
    return !hasNextPage || index < transactions.length;
  };

  // Render a list item or a loading indicator.
  const Item = ({ index, style }: { index: number; style: any }) => {
    if (!isItemLoaded(index)) {
      return <div style={style}>Loading...</div>;
    } else {
      const transaction = get(index, transactions);
      return (
        <TransactionItem transaction={transaction} transactionIndex={index} />
      );
    }
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      // @ts-ignore
      loadMoreItems={loadMoreItems}
      itemCount={itemCount}
      threshold={5}
    >
      {({ onItemsRendered, ref }) => (
        <VariableSizeList
          data-test="transaction-list"
          itemCount={transactions.length}
          ref={ref}
          onItemsRendered={onItemsRendered}
          height={500}
          itemSize={() => 166}
          width={900}
        >
          {Item}
        </VariableSizeList>
      )}
    </InfiniteLoader>
  );
};

export default TransactionInfiniteList;
