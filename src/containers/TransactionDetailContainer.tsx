import React, { useEffect } from "react";
import { useMachine, useActor } from "@xstate/react";
import { useParams } from "react-router-dom";
import TransactionDetail from "../components/TransactionDetail";
import { transactionDetailMachine } from "../machines/transactionDetailMachine";
import { first } from "lodash/fp";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}
interface Params {
  transactionId: string;
}

const TransactionDetailsContainer: React.FC<Props> = ({ authService }) => {
  const { transactionId }: Params = useParams();
  const [authState] = useActor(authService);
  const [transactionDetailState, sendTransactionDetail] = useMachine(transactionDetailMachine);
  useEffect(() => {
    sendTransactionDetail("FETCH", { transactionId });
  }, [sendTransactionDetail, transactionId]);

  const transactionComment = (payload: any) =>
    sendTransactionDetail("CREATE", { entity: "COMMENT", ...payload });

  const transactionUpdate = (payload: any) => sendTransactionDetail("UPDATE", payload);

  const transaction = first(transactionDetailState.context?.results);
  const currentUser = authState?.context?.user;

  return (
    <>
      {transactionDetailState.matches("idle") && (
        <div>
          Loading...
          <br />
        </div>
      )}
      {currentUser && transactionDetailState.matches("success") && (
        <TransactionDetail
          transaction={transaction}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default TransactionDetailsContainer;
