import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import TransactionList from "../components/TransactionList";
import { IRootReducerState } from "../reducers";
import { TransactionResponseItem } from "../models";
import { useRouteMatch } from "react-router";

export interface Props {
  publicTransactions: TransactionResponseItem[];
}

const TransactionsContainer: React.FC<Props> = ({ publicTransactions }) => {
  const match = useRouteMatch();

  let transactions = publicTransactions;

  const transactionUrls: any = {
    "/": publicTransactions,
    "/public": publicTransactions
    // '/friends': contactTransactions,
    // '/personal': personalTransactions,
  };

  transactions = transactionUrls[match.url];

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
