import React, { useState } from "react";
import { connect } from "react-redux";
import { IRootReducerState } from "../reducers";
import { User } from "../models";
import TransactionCreateStepOne from "../components/TransactionCreateStepOne";
import TransactionCreateStepTwo from "../components/TransactionCreateStepTwo";
import { transactionCreatePending } from "../actions/transactions";
import { usersSearchPending } from "../actions/users";

export interface DispatchProps {
  transactionCreate: (payload: object) => void;
  userListSearch: (payload: object) => void;
}
export interface StateProps {
  searchUsers: User[];
  allUsers: User[];
  sender: User;
}

export type TransactionCreateContainerProps = StateProps & DispatchProps;

const TransactionCreateContainer: React.FC<TransactionCreateContainerProps> = ({
  allUsers,
  searchUsers,
  sender,
  transactionCreate,
  userListSearch
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
    <TransactionCreateStepOne
      allUsers={allUsers}
      searchUsers={searchUsers}
      setReceiver={setReceiver}
      userListSearch={userListSearch}
    />
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  searchUsers: state.users.search,
  allUsers: state.users.all,
  sender: state.user.profile
});

const mapDispatchToProps = {
  transactionCreate: transactionCreatePending,
  userListSearch: usersSearchPending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionCreateContainer);
