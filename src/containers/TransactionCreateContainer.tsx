import React from "react";
import { connect } from "react-redux";
import { IRootReducerState } from "../reducers";
import { User, TransactionPayload } from "../models";
import TransactionCreateStepOne from "../components/TransactionCreateStepOne";
import TransactionCreateStepTwo from "../components/TransactionCreateStepTwo";
import { usersSearchPending } from "../actions/users";
import { useMachine } from "@xstate/react";
import { createTransactionMachine } from "../machines/createTransactionMachine";
import { useHistory } from "react-router";

export interface LocalProps {
  showSnackbar: Function;
  sender: User;
}

export interface DispatchProps {
  userListSearch: (payload: object) => void;
}
export interface StateProps {
  searchUsers: User[];
  allUsers: User[];
}

export type TransactionCreateContainerProps = LocalProps &
  StateProps &
  DispatchProps;

const TransactionCreateContainer: React.FC<TransactionCreateContainerProps> = ({
  allUsers,
  searchUsers,
  sender,
  userListSearch,
  showSnackbar
}) => {
  const history = useHistory();
  const [createTransactionState, sendCreateTransaction] = useMachine(
    createTransactionMachine,
    {
      devTools: true
    }
  );

  const setReceiver = (receiver: User) => {
    sendCreateTransaction("SET_USERS", { sender, receiver });
  };
  const createTransaction = (payload: TransactionPayload) => {
    //sendCreateTransaction("CREATE", payload);
    sendCreateTransaction("COMPLETE");
    history.push("/");
  };

  return (
    <>
      {createTransactionState.matches("stepOne") && (
        <TransactionCreateStepOne
          allUsers={allUsers}
          searchUsers={searchUsers}
          setReceiver={setReceiver}
          userListSearch={userListSearch}
        />
      )}
      {createTransactionState.matches("stepTwo") && (
        <TransactionCreateStepTwo
          receiver={createTransactionState.context.receiver}
          sender={sender}
          createTransaction={createTransaction}
          showSnackbar={showSnackbar}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  searchUsers: state.users.search,
  allUsers: state.users.all
});

const mapDispatchToProps = {
  userListSearch: usersSearchPending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionCreateContainer);
