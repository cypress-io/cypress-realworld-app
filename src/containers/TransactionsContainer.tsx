import React from "react";
import { connect } from "react-redux";
import { useMachine } from "@xstate/react";
import { useRouteMatch } from "react-router";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import {
  TransactionResponseItem,
  TransactionQueryPayload,
  TransactionDateRangePayload,
  TransactionAmountRangePayload
} from "../models";
import PublicTransactions from "../components/PublicTransactions";
import TransactionNavTabs from "../components/TransactionNavTabs";
import TransactionListFilters from "../components/TransactionListFilters";
import {
  transactionsPublicPending,
  transactionsClearFilters
} from "../actions/transactions";
import TransactionContactsList from "../components/TransactionContactsList";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import {
  getDateQueryFields,
  getAmountQueryFields
} from "../utils/transactionUtils";
import TransactionPersonalList from "../components/TransactionPersonalList";

export interface DispatchProps {
  filterPublicTransactions: Function;
  clearTransactionFilters: Function;
}

export interface StateProps {
  isLoadingTransactions: Boolean;
  publicTransactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
  transactionFilters: TransactionQueryPayload;
}

export type TransactionsContainerProps = StateProps & DispatchProps;

const TransactionsContainer: React.FC<TransactionsContainerProps> = ({
  isLoadingTransactions,
  publicTransactions,
  filterPublicTransactions,
  transactionFilters,
  clearTransactionFilters
}) => {
  const match = useRouteMatch();

  const [currentFilters, sendFilterEvent] = useMachine(
    transactionFiltersMachine,
    {
      devTools: true
    }
  );
  const filters = currentFilters.context;

  const hasDateRangeFilter = currentFilters.matches({ dateRange: "filter" });
  const hasAmountRangeFilter = currentFilters.matches({
    amountRange: "filter"
  });
  //sendFilterEvent("DATE_FILTER", { dateRangeStart: "START", dateRangeEnd: "END" });
  console.log("FILTERS", filters);

  const dateRangeFilters =
    hasDateRangeFilter && getDateQueryFields(currentFilters.context);
  const amountRangeFilters =
    hasAmountRangeFilter && getAmountQueryFields(currentFilters.context);
  //console.log("DR filter: ", dateRangeFilters);
  //console.log("AR filter: ", amountRangeFilters);

  const filterTransactions = (payload: object) => {
    filterPublicTransactions(payload);
  };

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
    <MainContainer>
      <TransactionNavTabs />
      {/*
      <TransactionListFilters
        transactionFilters={transactionFilters}
        filterTransactions={filterPublicTransactions}
        clearTransactionFilters={clearTransactionFilters}
      />
      */}
      <br />
      <PublicTransactions
        transactions={publicTransactions}
        isLoading={isLoadingTransactions}
      />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  isLoadingTransactions: state.transactions.meta.isLoading,
  publicTransactions: state.transactions.public,
  transactionFilters: state.transactions.filters
});

const mapDispatchToProps = {
  filterPublicTransactions: transactionsPublicPending,
  clearTransactionFilters: transactionsClearFilters
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsContainer);
