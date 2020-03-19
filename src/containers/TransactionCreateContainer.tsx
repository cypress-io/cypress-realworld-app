import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { useMachine, useService } from "@xstate/react";
import { User, TransactionPayload } from "../models";
import TransactionCreateStepOne from "../components/TransactionCreateStepOne";
import TransactionCreateStepTwo from "../components/TransactionCreateStepTwo";
import { createTransactionMachine } from "../machines/createTransactionMachine";
import { usersMachine } from "../machines/usersMachine";
import { debounce } from "lodash/fp";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";

export interface Props {
  showSnackbar: Function;
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const TransactionCreateContainer: React.FC<Props> = ({
  showSnackbar,
  authService
}) => {
  const history = useHistory();
  const [authState, sendAuth] = useService(authService);

  const [createTransactionState, sendCreateTransaction] = useMachine(
    createTransactionMachine,
    {
      devTools: true
    }
  );
  const [usersState, sendUsers] = useMachine(usersMachine);

  useEffect(() => {
    sendUsers({ type: "FETCH" });
  }, [sendUsers]);

  const sender = authState.context.user;
  const setReceiver = (receiver: User) => {
    sendCreateTransaction("SET_USERS", { sender, receiver });
  };
  const createTransaction = (payload: TransactionPayload) => {
    sendCreateTransaction("CREATE", payload);
    refreshUser();
    history.push("/");
  };
  const userListSearch = debounce(200, (payload: any) =>
    sendUsers("FETCH", payload)
  );
  const refreshUser = () => sendAuth("REFRESH");

  return (
    <>
      {createTransactionState.matches("stepOne") && (
        <TransactionCreateStepOne
          setReceiver={setReceiver}
          users={usersState.context.results!}
          userListSearch={userListSearch}
        />
      )}
      {sender && createTransactionState.matches("stepTwo") && (
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

export default TransactionCreateContainer;
