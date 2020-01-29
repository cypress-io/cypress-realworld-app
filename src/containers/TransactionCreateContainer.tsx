import React, { useState } from "react";
import { connect } from "react-redux";
import { IRootReducerState } from "../reducers";
import { User } from "../models";
import TransactionCreateStepOne from "../components/TransactionCreateStepOne";
import TransactionCreateStepTwo from "../components/TransactionCreateStepTwo";

export interface StateProps {
  searchUsers: User[];
  allUsers: User[];
  sender: User;
}

export type TransactionCreateContainerProps = StateProps;

const TransactionCreateContainer: React.FC<TransactionCreateContainerProps> = ({
  allUsers,
  sender
}) => {
  const [receiver, setReceiver] = useState();

  // TransactionCreateStepTwo / TransactionCreateForm
  if (receiver && sender) {
    return <TransactionCreateStepTwo receiver={receiver} sender={sender} />;
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

export default connect(mapStateToProps)(TransactionCreateContainer);
