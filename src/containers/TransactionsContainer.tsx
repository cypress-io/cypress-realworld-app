import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { TransactionResponseItem } from "../models";
import { useRouteMatch } from "react-router";
import PublicTransactions from "../components/PublicTransactions";
import TransactionList from "../components/TransactionList";

export interface StateProps {
  publicTransactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
  contactsTransactions: TransactionResponseItem[];
  personalTransactions: TransactionResponseItem[];
}

export type TransactionsContainerProps = StateProps;

const TransactionsContainer: React.FC<TransactionsContainerProps> = ({
  publicTransactions,
  contactsTransactions,
  personalTransactions
}) => {
  const match = useRouteMatch();

  if (match.url === "/contacts") {
    return (
      <MainContainer>
        <TransactionList
          header="Contacts"
          transactions={contactsTransactions}
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
        />
      </MainContainer>
    );
  }

  // match.url "/" or "/public"
  return (
    <MainContainer>
      <PublicTransactions transactions={publicTransactions} />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  publicTransactions: state.transactions.public,
  contactsTransactions: state.transactions.contacts,
  personalTransactions: state.transactions.personal
});

export default connect(mapStateToProps)(TransactionsContainer);
