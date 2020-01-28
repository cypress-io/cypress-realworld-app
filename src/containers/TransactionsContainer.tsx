import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { TransactionResponseItem } from "../models";
import { useRouteMatch } from "react-router";
import PublicTransactions from "../components/PublicTransactions";
import TransactionList from "../components/TransactionList";
import { transactionsLikePending } from "../actions/transactions";

export interface StateProps {
  publicTransactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
  contactsTransactions: TransactionResponseItem[];
  personalTransactions: TransactionResponseItem[];
}

export interface DispatchProps {
  transactionLike: Function;
}

export type TransactionsContainerProps = StateProps & DispatchProps;

const TransactionsContainer: React.FC<TransactionsContainerProps> = ({
  publicTransactions,
  contactsTransactions,
  personalTransactions,
  transactionLike
}) => {
  const match = useRouteMatch();

  if (match.url === "/contacts") {
    return (
      <MainContainer>
        <TransactionList
          header="Contacts"
          transactions={contactsTransactions}
          transactionLike={transactionLike}
        />
      </MainContainer>
    );
  }

  if (match.url === "/personal") {
    return (
      <MainContainer>
        <TransactionList
          header="Personal"
          transactions={personalTransactions}
          transactionLike={transactionLike}
        />
      </MainContainer>
    );
  }

  // match.url "/" or "/public"
  return (
    <MainContainer>
      <PublicTransactions
        transactions={publicTransactions}
        transactionLike={transactionLike}
      />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  publicTransactions: state.transactions.public,
  contactsTransactions: state.transactions.contacts,
  personalTransactions: state.transactions.personal
});

const mapDispatchToProps = {
  transactionLike: transactionsLikePending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsContainer);
