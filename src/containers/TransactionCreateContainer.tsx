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
import {
  SnackbarSchema,
  SnackbarContext,
  SnackbarEvents,
} from "../machines/snackbarMachine";
import { Stepper, Step, StepLabel } from "@material-ui/core";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
  snackbarService: Interpreter<
    SnackbarContext,
    SnackbarSchema,
    SnackbarEvents,
    any
  >;
}

const TransactionCreateContainer: React.FC<Props> = ({
  authService,
  snackbarService,
}) => {
  const history = useHistory();
  const [authState, sendAuth] = useService(authService);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [snackbarState, sendSnackbar] = useService(snackbarService);

  const [createTransactionState, sendCreateTransaction] = useMachine(
    createTransactionMachine,
    {
      devTools: true,
    }
  );
  const [usersState, sendUsers] = useMachine(usersMachine);

  useEffect(() => {
    sendUsers({ type: "FETCH" });
  }, [sendUsers]);

  const sender = authState?.context?.user;
  const refreshUser = () => sendAuth("REFRESH");
  const setReceiver = (receiver: User) => {
    sendCreateTransaction("SET_USERS", { sender, receiver });
  };
  const createTransaction = (payload: TransactionPayload) => {
    sendCreateTransaction("CREATE", payload);
    refreshUser();
    //history.push("/");
  };
  const userListSearch = debounce(200, (payload: any) =>
    sendUsers("FETCH", payload)
  );

  const showSnackbar = (payload: SnackbarContext) =>
    sendSnackbar("SHOW", payload);

  let activeStep;
  if (createTransactionState.matches("stepTwo")) {
    activeStep = 1;
  } else if (createTransactionState.matches("stepThree")) {
    activeStep = 3;
  } else {
    activeStep = 0;
  }

  return (
    <>
      <Stepper activeStep={activeStep}>
        <Step key={"stepOne"}>
          <StepLabel>Select Contact</StepLabel>
        </Step>
        <Step key={"stepTwo"}>
          <StepLabel>Payment</StepLabel>
        </Step>
        <Step key={"stepThree"}>
          <StepLabel>Confirm</StepLabel>
        </Step>
      </Stepper>
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
      {createTransactionState.matches("stepThree") && <div>Confirmation</div>}
    </>
  );
};

export default TransactionCreateContainer;
