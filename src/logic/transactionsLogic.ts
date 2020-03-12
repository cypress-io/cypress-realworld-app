import { createLogic } from "redux-logic";
import {
  TRANSACTIONS_LIKE_PENDING,
  TRANSACTIONS_LIKE_SUCCESS,
  TRANSACTIONS_LIKE_ERROR,
  TRANSACTIONS_COMMENT_PENDING,
  TRANSACTIONS_COMMENT_SUCCESS,
  TRANSACTIONS_COMMENT_ERROR,
  TRANSACTION_DETAIL_PENDING,
  TRANSACTION_DETAIL_SUCCESS,
  TRANSACTION_DETAIL_ERROR,
  transactionDetailPending,
  TRANSACTION_UPDATE_PENDING,
  TRANSACTION_UPDATE_SUCCESS,
  TRANSACTION_UPDATE_ERROR
} from "../actions/transactions";
import { history } from "../index";
import {
  isRequestTransaction,
  pathTransactionId,
  isNewTransactionPath
} from "../utils/transactionUtils";

const transactionsLikeLogic = createLogic({
  type: TRANSACTIONS_LIKE_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: TRANSACTIONS_LIKE_SUCCESS,
    failType: TRANSACTIONS_LIKE_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    return (
      httpClient
        // @ts-ignore
        .post(`http://localhost:3001/likes/${action.payload.transactionId}`)
        .then((resp: any) => resp.data)
    );
  }
});

const transactionsCommentLogic = createLogic({
  type: TRANSACTIONS_COMMENT_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: TRANSACTIONS_COMMENT_SUCCESS,
    failType: TRANSACTIONS_COMMENT_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    // @ts-ignore
    const { payload } = action;

    return httpClient
      .post(`http://localhost:3001/comments/${payload.transactionId}`, {
        content: payload.content
      })
      .then((resp: any) => resp.data);
  }
});

const transactionDetailLogic = createLogic({
  type: TRANSACTION_DETAIL_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: TRANSACTION_DETAIL_SUCCESS,
    failType: TRANSACTION_DETAIL_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    // @ts-ignore
    const { payload } = action;

    history.push(`/transaction/${payload.transactionId}`);

    return httpClient
      .get(`http://localhost:3001/transactions/${payload.transactionId}`)
      .then((resp: any) => resp.data.transaction);
  }
});

const transactionsRefreshLogic = createLogic({
  type: [
    TRANSACTION_UPDATE_SUCCESS,
    TRANSACTIONS_LIKE_SUCCESS,
    TRANSACTIONS_COMMENT_SUCCESS
  ],

  // @ts-ignore
  // eslint-disable-next-line no-empty-pattern
  process({ action }, dispatch, done) {
    const { pathname } = window.location;
    // @ts-ignore
    const { payload } = action;

    if (isNewTransactionPath(pathname)) {
      if (isRequestTransaction(payload.transaction)) {
        //history.push("/personal");
      }
      //history.push("/");
    }

    const transactionId = pathTransactionId(pathname);
    if (transactionId) {
      dispatch(
        transactionDetailPending({
          transactionId
        })
      );
    }
    done();
  }
});

const transactionUpdateLogic = createLogic({
  type: TRANSACTION_UPDATE_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: TRANSACTION_UPDATE_SUCCESS,
    failType: TRANSACTION_UPDATE_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    // @ts-ignore
    const { payload } = action;

    return (
      httpClient
        // @ts-ignore
        .patch(`http://localhost:3001/transactions/${payload.id}`, payload)
        .then((resp: any) => resp.data)
    );
  }
});

export default [
  transactionsLikeLogic,
  transactionsCommentLogic,
  transactionDetailLogic,
  transactionsRefreshLogic,
  transactionUpdateLogic
];
