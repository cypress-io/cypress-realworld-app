import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import TransactionList from "../components/TransactionList";
import { IRootReducerState } from "../reducers";
import { Transaction } from "../models";

export interface Props {
  publicTransactions: Transaction[];
}

const TransactionsContainer: React.FC<Props> = ({ publicTransactions }) => {
  return (
    <MainContainer>
      <TransactionList transactions={publicTransactions} />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  publicTransactions: state.transactions.public
});

export default connect(mapStateToProps)(TransactionsContainer);
