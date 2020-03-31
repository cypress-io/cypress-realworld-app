import React from "react";
import { useMachine } from "@xstate/react";
import { useRouteMatch } from "react-router";
import {
  TransactionDateRangePayload,
  TransactionAmountRangePayload,
} from "../models";
import TransactionListFilters from "../components/TransactionListFilters";
import TransactionContactsList from "../components/TransactionContactsList";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import {
  getDateQueryFields,
  getAmountQueryFields,
} from "../utils/transactionUtils";
import TransactionPersonalList from "../components/TransactionPersonalList";
import TransactionPublicList from "../components/TransactionPublicList";

const TransactionsContainer: React.FC = () => {
  const match = useRouteMatch();

  const [currentFilters, sendFilterEvent] = useMachine(
    transactionFiltersMachine,
    {
      devTools: true,
    }
  );

  const hasDateRangeFilter = currentFilters.matches({ dateRange: "filter" });
  const hasAmountRangeFilter = currentFilters.matches({
    amountRange: "filter",
  });

  const dateRangeFilters =
    hasDateRangeFilter && getDateQueryFields(currentFilters.context);
  const amountRangeFilters =
    hasAmountRangeFilter && getAmountQueryFields(currentFilters.context);

  const Filters = (
    <TransactionListFilters
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      sendFilterEvent={sendFilterEvent}
    />
  );

  if (match.url === "/contacts") {
    return (
      <TransactionContactsList
        filterComponent={Filters}
        dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
        amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      />
    );
  }

  if (match.url === "/personal") {
    return (
      <TransactionPersonalList
        filterComponent={Filters}
        dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
        amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      />
    );
  }

  // match.url "/" or "/public"
  return (
    <TransactionPublicList
      filterComponent={Filters}
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
    />
  );
};

export default TransactionsContainer;
