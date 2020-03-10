import { createLogic } from "redux-logic";
import {
  TRANSACTIONS_PUBLIC_PENDING,
  TRANSACTIONS_PUBLIC_SUCCESS,
  TRANSACTIONS_PUBLIC_ERROR,
  TRANSACTIONS_LIKE_PENDING,
  TRANSACTIONS_LIKE_SUCCESS,
  TRANSACTIONS_LIKE_ERROR,
  TRANSACTIONS_COMMENT_PENDING,
  TRANSACTIONS_COMMENT_SUCCESS,
  TRANSACTIONS_COMMENT_ERROR,
  transactionsPublicPending,
  TRANSACTION_DETAIL_PENDING,
  TRANSACTION_DETAIL_SUCCESS,
  TRANSACTION_DETAIL_ERROR,
  transactionDetailPending,
  TRANSACTION_CREATE_PENDING,
  TRANSACTION_CREATE_SUCCESS,
  TRANSACTION_CREATE_ERROR,
  TRANSACTION_UPDATE_PENDING,
  TRANSACTION_UPDATE_SUCCESS,
  TRANSACTION_UPDATE_ERROR,
  TRANSACTIONS_CLEAR_FILTERS
} from "../actions/transactions";
import { history } from "../index";
import {
  isRequestTransaction,
  pathTransactionId,
  isNewTransactionPath
} from "../utils/transactionUtils";
import { appBootstrapPending } from "../actions/app";
import { isEmpty } from "lodash/fp";

const transactionsPublicLogic = createLogic({
  type: TRANSACTIONS_PUBLIC_PENDING,
  debounce: 500, // ms
  latest: true, // take latest only
  processOptions: {
    dispatchReturn: true,
    successType: TRANSACTIONS_PUBLIC_SUCCESS,
    failType: TRANSACTIONS_PUBLIC_ERROR
  },

  // @ts-ignore
  process({ httpClient, action, getState }) {
    const state = getState();

    // @ts-ignore
    const { transactions } = state;
    const { filters } = transactions;
    // @ts-ignore
    const { payload } = action;

    return httpClient
      .get(
        `http://localhost:3001/transactions/public`,

        {
          params: !isEmpty(filters) ? filters : payload
        }
      )
      .then((resp: any) => resp.data.transactions);
  }
});

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

const transactionCreateLogic = createLogic({
  type: TRANSACTION_CREATE_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: TRANSACTION_CREATE_SUCCESS,
    failType: TRANSACTION_CREATE_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    return (
      httpClient
        // @ts-ignore
        .post("http://localhost:3001/transactions", action.payload)
        .then((resp: any) => resp.data)
    );
  }
});

const transactionsRefreshLogic = createLogic({
  type: [
    TRANSACTION_CREATE_SUCCESS,
    TRANSACTION_UPDATE_SUCCESS,
    TRANSACTIONS_LIKE_SUCCESS,
    TRANSACTIONS_COMMENT_SUCCESS,
    TRANSACTIONS_CLEAR_FILTERS
  ],

  // @ts-ignore
  // eslint-disable-next-line no-empty-pattern
  process({ action }, dispatch, done) {
    const { pathname } = window.location;
    // @ts-ignore
    const { payload } = action;

    if (isNewTransactionPath(pathname)) {
      if (isRequestTransaction(payload.transaction)) {
        history.push("/personal");
      }
      history.push("/");
    }

    const transactionId = pathTransactionId(pathname);
    if (transactionId) {
      dispatch(
        transactionDetailPending({
          transactionId
        })
      );
    }

    dispatch(transactionsPublicPending());
    if (action.type === TRANSACTION_CREATE_SUCCESS) {
      dispatch(appBootstrapPending({}));
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
  transactionsPublicLogic,
  transactionsLikeLogic,
  transactionsCommentLogic,
  transactionDetailLogic,
  transactionCreateLogic,
  transactionsRefreshLogic,
  transactionUpdateLogic
];
