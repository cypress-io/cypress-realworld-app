import React from "react";
import { useMachine } from "@xstate/react";
import { Switch, Route } from "react-router";
import { TransactionDateRangePayload, TransactionAmountRangePayload } from "../models";
import TransactionListFilters from "../components/TransactionListFilters";
import TransactionContactsList from "../components/TransactionContactsList";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import { getDateQueryFields, getAmountQueryFields } from "../utils/transactionUtils";
import TransactionPersonalList from "../components/TransactionPersonalList";
import TransactionPublicList from "../components/TransactionPublicList";

const TransactionsContainer: React.FC = () => {
  const [currentFilters, sendFilterEvent] = useMachine(transactionFiltersMachine);

  const hasDateRangeFilter = currentFilters.matches({ dateRange: "filter" });
  const hasAmountRangeFilter = currentFilters.matches({
    amountRange: "filter",
  });

  const dateRangeFilters = hasDateRangeFilter && getDateQueryFields(currentFilters.context);
  const amountRangeFilters = hasAmountRangeFilter && getAmountQueryFields(currentFilters.context);

  const Filters = (
    <TransactionListFilters
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      sendFilterEvent={sendFilterEvent}
    />
  );

  return (
    <Switch>
      <Route exact path="/contacts">
        <TransactionContactsList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
        />
      </Route>
      <Route exact path="/personal">
        <TransactionPersonalList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
        />
      </Route>
      <Route exact path="/(public)?">
        <TransactionPublicList
          filterComponent={Filters}
          dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
          amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
        />
      </Route>
    </Switch>
  );
};

export default TransactionsContainer;
