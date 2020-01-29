import React, { useState } from "react";
import { connect } from "react-redux";
import { IRootReducerState } from "../reducers";
import { User } from "../models";
import TransactionCreateStepOne from "../components/TransactionCreateStepOne";
import TransactionCreateStepTwo from "../components/TransactionCreateStepTwo";
import { transactionCreatePending } from "../actions/transactions";

export interface DispatchProps {
  transactionCreate: (payload: object) => void;
}
export interface StateProps {
  searchUsers: User[];
  allUsers: User[];
  sender: User;
}

export type TransactionCreateContainerProps = StateProps & DispatchProps;

const TransactionCreateContainer: React.FC<TransactionCreateContainerProps> = ({
  allUsers,
  sender,
  transactionCreate
}) => {
  const [receiver, setReceiver] = useState();

  // TransactionCreateStepTwo / TransactionCreateForm
  if (receiver && sender) {
    return (
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        transactionCreate={transactionCreate}
      />
    );
  }

  // TransactionCreateStepOne / TransactionCreateSelectUser
  return (
    <TransactionCreateStepOne allUsers={allUsers} setReceiver={setReceiver} />
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  searchUsers: state.users.search,
  allUsers: state.users.all,
  sender: state.user.profile
});

const mapDispatchToProps = {
  transactionCreate: transactionCreatePending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionCreateContainer);
