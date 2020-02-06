import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import MainContainer from "./MainContainer";
import TransactionDetail from "../components/TransactionDetail";
import { IRootReducerState } from "../reducers";
import { TransactionResponseItem, User } from "../models";
import {
  transactionsLikePending,
  transactionsCommentPending,
  transactionDetailPending,
  transactionUpdatePending
} from "../actions/transactions";

export interface StateProps {
  transaction?: TransactionResponseItem;
  currentUser: User;
}

export interface DispatchProps {
  transactionLike: Function;
  transactionComment: Function;
  transactionDetail: Function;
  transactionUpdate: Function;
}

export type TransactionDetailsContainerProps = StateProps & DispatchProps;

const TransactionDetailsContainer: React.FC<TransactionDetailsContainerProps> = ({
  transaction,
  transactionLike,
  transactionComment,
  transactionDetail,
  transactionUpdate,
  currentUser
}) => {
  const { transactionId } = useParams();

  useEffect(() => {
    if (
      (!transaction && transactionId) ||
      (transaction && transaction.id !== transactionId)
    ) {
      transactionDetail({ transactionId });
    }
  }, [transaction, transactionId, transactionDetail]);

  if (
    !transaction ||
    (!transaction && transactionId) ||
    (transaction && transaction.id !== transactionId)
  ) {
    return (
      <MainContainer>
        Loading...
        <br />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <TransactionDetail
        transaction={transaction}
        transactionLike={transactionLike}
        transactionComment={transactionComment}
        transactionUpdate={transactionUpdate}
        currentUser={currentUser}
      />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  transaction: state.transactions.transactionDetails,
  currentUser: state.user.profile
});

const mapDispatchToProps = {
  transactionLike: transactionsLikePending,
  transactionComment: transactionsCommentPending,
  transactionDetail: transactionDetailPending,
  transactionUpdate: transactionUpdatePending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionDetailsContainer);
