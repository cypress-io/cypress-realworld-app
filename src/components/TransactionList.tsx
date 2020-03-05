import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@material-ui/core";
import List from "@material-ui/core/List";
import InfiniteLoader from "react-window-infinite-loader";
import { VariableSizeList } from "react-window";

import SkeletonList from "./SkeletonList";
import TransactionItem from "./TransactionItem";
import { TransactionResponseItem } from "../models";
import EmptyList from "./EmptyList";
import { get } from "lodash/fp";

export interface TransactionListProps {
  header: string;
  transactions: TransactionResponseItem[];
  isLoading: Boolean;
  showCreateButton?: Boolean;
  infinite?: Boolean;
  loadNextPage?: Function;
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
  infinite,
  loadNextPage
}) => {
  const classes = useStyles();
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const itemCount = hasNextPage ? transactions.length + 1 : transactions.length;

  const loadMoreItems = (startIndex: number, stopIndex: number) => {
    console.log({ startIndex });
    console.log({ stopIndex });
    if (loadNextPage && startIndex === 10) {
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
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        {header}
      </Typography>
      {isLoading && <SkeletonList />}
      {transactions.length > 0 ? (
        infinite ? (
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
        ) : (
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
        )
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
