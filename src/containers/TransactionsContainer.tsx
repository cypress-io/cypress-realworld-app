import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { TransactionResponseItem, TransactionQueryPayload } from "../models";
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

  const filterTransactions = (payload: object) => {
    filterPublicTransactions(payload);
    filterPersonalTransactions(payload);
    filterContactTransactions(payload);
  };

  if (match.url === "/contacts") {
    return (
      <TransactionContactsList
        transactionFilters={transactionFilters}
        clearTransactionFilters={clearTransactionFilters}
        filterContactTransactions={filterContactTransactions}
      />
    );
  }

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
        filterTransactions={filterTransactions}
        clearTransactionFilters={clearTransactionFilters}
      />
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
