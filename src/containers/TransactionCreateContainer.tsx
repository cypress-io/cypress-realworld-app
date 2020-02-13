import React, { useState } from "react";
import { connect } from "react-redux";
import { IRootReducerState } from "../reducers";
import { User } from "../models";
import TransactionCreateStepOne from "../components/TransactionCreateStepOne";
import TransactionCreateStepTwo from "../components/TransactionCreateStepTwo";
import { transactionCreatePending } from "../actions/transactions";
import { usersSearchPending } from "../actions/users";
import { appSnackBarInit } from "../actions/app";

export interface DispatchProps {
  transactionCreate: (payload: object) => void;
  userListSearch: (payload: object) => void;
  snackbarInit: Function;
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
  userListSearch,
  snackbarInit
}) => {
  const [receiver, setReceiver] = useState();

  // TransactionCreateStepTwo / TransactionCreateForm
  if (receiver && sender) {
    return (
      <TransactionCreateStepTwo
        receiver={receiver}
        sender={sender}
        transactionCreate={transactionCreate}
        snackbarInit={snackbarInit}
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
  userListSearch: usersSearchPending,
  snackbarInit: appSnackBarInit
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionCreateContainer);
