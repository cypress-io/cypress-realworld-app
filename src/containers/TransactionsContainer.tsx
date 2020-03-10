import React, { useEffect } from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import {
  TransactionResponseItem,
  TransactionQueryPayload,
  TransactionDateRangePayload,
  TransactionAmountRangePayload
} from "../models";
import { useRouteMatch } from "react-router";
import PublicTransactions from "../components/PublicTransactions";
import TransactionList from "../components/TransactionList";
import TransactionNavTabs from "../components/TransactionNavTabs";
import TransactionListFilters from "../components/TransactionListFilters";
import {
  transactionsPublicPending,
  transactionsPersonalPending,
  transactionsContactsPending,
  transactionsClearFilters
} from "../actions/transactions";
import TransactionContactsList from "../components/TransactionContactsList";
import { useMachine } from "@xstate/react";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import {
  getDateQueryFields,
  getAmountQueryFields
} from "../utils/transactionUtils";

export interface DispatchProps {
  filterPublicTransactions: Function;
  filterPersonalTransactions: Function;
  filterContactTransactions: Function;
  clearTransactionFilters: Function;
}

export interface StateProps {
  isLoadingTransactions: Boolean;
  publicTransactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
  personalTransactions: TransactionResponseItem[];
  transactionFilters: TransactionQueryPayload;
}

export type TransactionsContainerProps = StateProps & DispatchProps;

const TransactionsContainer: React.FC<TransactionsContainerProps> = ({
  isLoadingTransactions,
  publicTransactions,
  personalTransactions,
  filterPublicTransactions,
  filterPersonalTransactions,
  filterContactTransactions,
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
  console.log("DR filter: ", dateRangeFilters);
  console.log("AR filter: ", amountRangeFilters);

  const filterTransactions = (payload: object) => {
    filterPublicTransactions(payload);
    filterPersonalTransactions(payload);
    filterContactTransactions(payload);
  };

  const Filters = (
    <TransactionListFilters
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      sendFilterEvent={sendFilterEvent}
    />
  );

  //if (match.url === "/contacts") {
  return (
    <TransactionContactsList
      filterComponent={Filters}
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
    />
  );
  //}

  /*
  if (match.url === "/personal") {
    return (
      <MainContainer>
        <TransactionNavTabs />
        <TransactionListFilters
          transactionFilters={transactionFilters}
          filterTransactions={filterTransactions}
          clearTransactionFilters={clearTransactionFilters}
        />
        <br />
        <TransactionList
          header="Personal"
          transactions={personalTransactions}
          isLoading={isLoadingTransactions}
          showCreateButton={true}
        />
      </MainContainer>
    );
  }

  // match.url "/" or "/public"
  return (
    <MainContainer>
      <TransactionNavTabs />
      <TransactionListFilters
        transactionFilters={transactionFilters}
        filterTransactions={filterPublicTransactions}
        clearTransactionFilters={clearTransactionFilters}
      />
      <br />
      <PublicTransactions
        transactions={publicTransactions}
        isLoading={isLoadingTransactions}
      />
    </MainContainer>
  );
  */
};

const mapStateToProps = (state: IRootReducerState) => ({
  isLoadingTransactions: state.transactions.meta.isLoading,
  publicTransactions: state.transactions.public,
  personalTransactions: state.transactions.personal,
  transactionFilters: state.transactions.filters
});

const mapDispatchToProps = {
  filterPublicTransactions: transactionsPublicPending,
  filterPersonalTransactions: transactionsPersonalPending,
  filterContactTransactions: transactionsContactsPending,
  clearTransactionFilters: transactionsClearFilters
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsContainer);
