export const TRANSACTIONS_PUBLIC_PENDING = "TRANSACTIONS_PUBLIC_PENDING";
export const TRANSACTIONS_PUBLIC_SUCCESS = "TRANSACTIONS_PUBLIC_SUCCESS";
export const TRANSACTIONS_PUBLIC_ERROR = "TRANSACTIONS_PUBLIC_ERROR";
export const TRANSACTIONS_CONTACTS_PENDING = "TRANSACTIONS_CONTACTS_PENDING";
export const TRANSACTIONS_CONTACTS_SUCCESS = "TRANSACTIONS_CONTACTS_SUCCESS";
export const TRANSACTIONS_CONTACTS_ERROR = "TRANSACTIONS_CONTACTS_ERROR";
export const TRANSACTIONS_PERSONAL_PENDING = "TRANSACTIONS_PERSONAL_PENDING";
export const TRANSACTIONS_PERSONAL_SUCCESS = "TRANSACTIONS_PERSONAL_SUCCESS";
export const TRANSACTIONS_PERSONAL_ERROR = "TRANSACTIONS_PERSONAL_ERROR";
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

export const transactionsPublicPending = () =>
  ({
    type: TRANSACTIONS_PUBLIC_PENDING
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

export const transactionsContactsPending = () =>
  ({
    type: TRANSACTIONS_CONTACTS_PENDING
  } as const);

export const transactionsContactsSuccess = (payload: any) =>
  ({
    type: TRANSACTIONS_CONTACTS_SUCCESS,
    payload
  } as const);

export const transactionsContactsError = (payload: any) =>
  ({
    type: TRANSACTIONS_CONTACTS_ERROR,
    payload,
    error: true
  } as const);

export const transactionsPersonalPending = () =>
  ({
    type: TRANSACTIONS_PERSONAL_PENDING
  } as const);

export const transactionsPersonalSuccess = (payload: any) =>
  ({
    type: TRANSACTIONS_PERSONAL_SUCCESS,
    payload
  } as const);

export const transactionsPersonalError = (payload: any) =>
  ({
    type: TRANSACTIONS_PERSONAL_ERROR,
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

export const transactionCreateSuccess = (payload: any) =>
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

export type TTransactionActions =
  | ReturnType<typeof transactionsPublicPending>
  | ReturnType<typeof transactionsPublicSuccess>
  | ReturnType<typeof transactionsPublicError>
  | ReturnType<typeof transactionsContactsPending>
  | ReturnType<typeof transactionsContactsSuccess>
  | ReturnType<typeof transactionsContactsError>
  | ReturnType<typeof transactionsPersonalPending>
  | ReturnType<typeof transactionsPersonalSuccess>
  | ReturnType<typeof transactionsPersonalError>
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
  | ReturnType<typeof transactionCreateError>;

export type TransactionActionDataTypes = TTransactionActions["type"];
