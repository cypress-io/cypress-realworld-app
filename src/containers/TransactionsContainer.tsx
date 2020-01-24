import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import TransactionList from "../components/TransactionList";
import { IRootReducerState } from "../reducers";
import { Transaction } from "../models";
import { useRouteMatch } from "react-router";

export interface Props {
  publicTransactions: Transaction[];
}

const TransactionsContainer: React.FC<Props> = ({ publicTransactions }) => {
  const match = useRouteMatch();

  let transactions = publicTransactions;
  if (match.url === "/friends") {
    // transactions = friendsTransactions;
  } else if (match.url === "/personal") {
    // transactions = personalTransactions;
  }

  return (
    <MainContainer>
      <TransactionList transactions={transactions} />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  publicTransactions: state.transactions.public
});

export default connect(mapStateToProps)(TransactionsContainer);
