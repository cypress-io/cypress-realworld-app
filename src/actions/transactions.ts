export const TRANSACTIONS_PUBLIC_PENDING = "TRANSACTIONS_PENDING";
export const TRANSACTIONS_PUBLIC_SUCCESS = "TRANSACTIONS_SUCCESS";
export const TRANSACTIONS_PUBLIC_ERROR = "TRANSACTIONS_ERROR";

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

export type TTransactionActions =
  | ReturnType<typeof transactionsPublicPending>
  | ReturnType<typeof transactionsPublicSuccess>
  | ReturnType<typeof transactionsPublicError>;

export type TransactionActionDataTypes = TTransactionActions["type"];
