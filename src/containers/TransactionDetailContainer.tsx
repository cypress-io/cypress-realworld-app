import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import MainContainer from "./MainContainer";
import TransactionDetail from "../components/TransactionDetail";
import { IRootReducerState } from "../reducers";
import { TransactionResponseItem } from "../models";
import {
  transactionsLikePending,
  transactionsCommentPending,
  transactionDetailPending
} from "../actions/transactions";

export interface StateProps {
  transaction?: TransactionResponseItem;
}

export interface DispatchProps {
  transactionLike: Function;
  transactionComment: Function;
  transactionDetail: Function;
}

export type TransactionDetailsContainerProps = StateProps & DispatchProps;

const TransactionDetailsContainer: React.FC<TransactionDetailsContainerProps> = ({
  transaction,
  transactionLike,
  transactionComment,
  transactionDetail
}) => {
  const { transactionId } = useParams();

  useEffect(() => {
    if (
      (!transaction && transactionId) ||
      (transaction && transaction.id !== transactionId)
    ) {
      transactionDetail({ transactionId });
    }
  });

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
      />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  transaction: state.transactions.transactionDetails
});

const mapDispatchToProps = {
  transactionLike: transactionsLikePending,
  transactionComment: transactionsCommentPending,
  transactionDetail: transactionDetailPending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionDetailsContainer);
