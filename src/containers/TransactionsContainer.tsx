import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { TransactionResponseItem } from "../models";
import { useRouteMatch } from "react-router";
import PublicTransactions from "../components/PublicTransactions";

export interface Props {
  publicTransactions: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
}

const TransactionsContainer: React.FC<Props> = ({ publicTransactions }) => {
  const match = useRouteMatch();

  if (match.url === "/friends") {
    return <MainContainer></MainContainer>;
  }

  if (match.url === "/personal") {
    return <MainContainer></MainContainer>;
  }

  // match.url "/" or "/public"
  return (
    <MainContainer>
      <PublicTransactions transactions={publicTransactions} />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  publicTransactions: state.transactions.public
});

export default connect(mapStateToProps)(TransactionsContainer);
