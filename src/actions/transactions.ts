import {
  Transaction,
  TransactionUpdateActionPayload,
  TransactionQueryPayload,
  TransactionClearFiltersPayload
} from "../models";

export const TRANSACTIONS_PUBLIC_PENDING = "TRANSACTIONS_PUBLIC_PENDING";
export const TRANSACTIONS_PUBLIC_SUCCESS = "TRANSACTIONS_PUBLIC_SUCCESS";
export const TRANSACTIONS_PUBLIC_ERROR = "TRANSACTIONS_PUBLIC_ERROR";
export const TRANSACTIONS_LIKE_PENDING = "TRANSACTIONS_LIKE_PENDING";
export const TRANSACTIONS_LIKE_SUCCESS = "TRANSACTIONS_LIKE_SUCCESS";
export const TRANSACTIONS_LIKE_ERROR = "TRANSACTIONS_LIKE_ERROR";
export const TRANSACTIONS_COMMENT_PENDING = "TRANSACTIONS_COMMENT_PENDING";
export const TRANSACTIONS_COMMENT_SUCCESS = "TRANSACTIONS_COMMENT_SUCCESS";
export const TRANSACTIONS_COMMENT_ERROR = "TRANSACTION_COMMENT_ERROR";
export const TRANSACTION_DETAIL_PENDING = "TRANSACTION_DETAIL_PENDING";
export const TRANSACTION_DETAIL_SUCCESS = "TRANSACTION_DETAIL_SUCCESS";
export const TRANSACTION_DETAIL_ERROR = "TRANSACTIONS_DETAIL_ERROR";
export const TRANSACTION_CREATE_PENDING = "TRANSACTION_CREATE_PENDING";
export const TRANSACTION_CREATE_SUCCESS = "TRANSACTION_CREATE_SUCCESS";
export const TRANSACTION_CREATE_ERROR = "TRANSACTION_CREATE_ERROR";
export const TRANSACTION_UPDATE_PENDING = "TRANSACTION_UPDATE_PENDING";
export const TRANSACTION_UPDATE_SUCCESS = "TRANSACTION_UPDATE_SUCCESS";
export const TRANSACTION_UPDATE_ERROR = "TRANSACTION_UPDATE_ERROR";

export const TRANSACTIONS_CLEAR_FILTERS = "TRANSACTIONS_CLEAR_FILTERS";

export const transactionsClearFilters = (
  payload: TransactionClearFiltersPayload
) =>
  ({
    type: TRANSACTIONS_CLEAR_FILTERS,
    payload
  } as const);

export const transactionsPublicPending = (payload?: TransactionQueryPayload) =>
  ({
    type: TRANSACTIONS_PUBLIC_PENDING,
    payload
  } as const);

export const transactionsPublicSuccess = (payload: any) =>
  ({
    type: TRANSACTIONS_PUBLIC_SUCCESS,
    payload
  } as const);

export const transactionsPublicError = (payload: any) =>
  ({
    type: TRANSACTIONS_PUBLIC_ERROR,
    payload,
    error: true
  } as const);

export const transactionsLikePending = (payload: object) =>
  ({
    type: TRANSACTIONS_LIKE_PENDING,
    payload
  } as const);

export const transactionsLikeSuccess = (payload: any) =>
  ({
    type: TRANSACTIONS_LIKE_SUCCESS,
    payload
  } as const);

export const transactionsLikeError = (payload: any) =>
  ({
    type: TRANSACTIONS_LIKE_ERROR,
    payload,
    error: true
  } as const);

export const transactionsCommentPending = (payload: object) =>
  ({
    type: TRANSACTIONS_COMMENT_PENDING,
    payload
  } as const);

export const transactionsCommentSuccess = (payload: any) =>
  ({
    type: TRANSACTIONS_COMMENT_SUCCESS,
    payload
  } as const);

export const transactionsCommentError = (payload: any) =>
  ({
    type: TRANSACTIONS_COMMENT_ERROR,
    payload,
    error: true
  } as const);

export const transactionDetailPending = (payload: object) =>
  ({
    type: TRANSACTION_DETAIL_PENDING,
    payload
  } as const);

export const transactionDetailSuccess = (payload: any) =>
  ({
    type: TRANSACTION_DETAIL_SUCCESS,
    payload
  } as const);

export const transactionDetailError = (payload: any) =>
  ({
    type: TRANSACTION_DETAIL_ERROR,
    payload,
    error: true
  } as const);

export const transactionCreatePending = (payload: object) =>
  ({
    type: TRANSACTION_CREATE_PENDING,
    payload
  } as const);

export const transactionCreateSuccess = (payload: {
  transaction: Transaction;
}) =>
  ({
    type: TRANSACTION_CREATE_SUCCESS,
    payload
  } as const);

export const transactionCreateError = (payload: any) =>
  ({
    type: TRANSACTION_CREATE_ERROR,
    payload,
    error: true
  } as const);

export const transactionUpdatePending = (
  payload: TransactionUpdateActionPayload
) =>
  ({
    type: TRANSACTION_UPDATE_PENDING,
    payload
  } as const);

export const transactionUpdateSuccess = (payload: {
  transaction: Transaction;
}) =>
  ({
    type: TRANSACTION_UPDATE_SUCCESS,
    payload
  } as const);

export const transactionUpdateError = (payload: any) =>
  ({
    type: TRANSACTION_UPDATE_ERROR,
    payload,
    error: true
  } as const);

export type TTransactionActions =
  | ReturnType<typeof transactionsPublicPending>
  | ReturnType<typeof transactionsPublicSuccess>
  | ReturnType<typeof transactionsPublicError>
  | ReturnType<typeof transactionsLikePending>
  | ReturnType<typeof transactionsLikeSuccess>
  | ReturnType<typeof transactionsLikeError>
  | ReturnType<typeof transactionsCommentPending>
  | ReturnType<typeof transactionsCommentSuccess>
  | ReturnType<typeof transactionsCommentError>
  | ReturnType<typeof transactionDetailPending>
  | ReturnType<typeof transactionDetailSuccess>
  | ReturnType<typeof transactionDetailError>
  | ReturnType<typeof transactionCreatePending>
  | ReturnType<typeof transactionCreateSuccess>
  | ReturnType<typeof transactionCreateError>
  | ReturnType<typeof transactionUpdatePending>
  | ReturnType<typeof transactionUpdateSuccess>
  | ReturnType<typeof transactionUpdateError>
  | ReturnType<typeof transactionsClearFilters>;

export type TransactionActionDataTypes = TTransactionActions["type"];
