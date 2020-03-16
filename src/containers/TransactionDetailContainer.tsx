import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import { useParams } from "react-router-dom";
import TransactionDetail from "../components/TransactionDetail";
import { User, Transaction } from "../models";
import { transactionDetailMachine } from "../machines/transactionDetailMachine";
import { first } from "lodash/fp";

export interface Props {
  currentUser?: User;
}

const TransactionDetailsContainer: React.FC<Props> = ({ currentUser }) => {
  const { transactionId } = useParams();
  const [transactionDetailState, sendTransactionDetail] = useMachine(
    transactionDetailMachine,
    {
      devTools: true
    }
  );
  useEffect(() => {
    sendTransactionDetail("FETCH", { transactionId });
  }, [sendTransactionDetail, transactionId]);

  const transactionLike = (transactionId: Transaction["id"]) =>
    sendTransactionDetail("CREATE", { entity: "LIKE", transactionId });

  const transactionComment = (payload: any) =>
    sendTransactionDetail("CREATE", { entity: "COMMENT", ...payload });

  const transactionUpdate = (payload: any) =>
    sendTransactionDetail("UPDATE", payload);

  const transaction = first(transactionDetailState.context?.results);

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
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default TransactionDetailsContainer;
