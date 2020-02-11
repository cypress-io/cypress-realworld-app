import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { BankAccount } from "../models";
import BankAccountList from "../components/BankAccountList";

export interface StateProps {
  bankAccounts: BankAccount[];
}

export type BankAccountsContainerProps = StateProps;

const BankAccountsContainer: React.FC<BankAccountsContainerProps> = ({
  bankAccounts
}) => {
  return (
    <MainContainer>
      <BankAccountList bankAccounts={bankAccounts} />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  bankAccounts: state.bankaccounts.all
});

export default connect(mapStateToProps)(BankAccountsContainer);
