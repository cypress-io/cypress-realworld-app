export const TRANSACTIONS_PUBLIC_PENDING = "TRANSACTIONS_PUBLIC_PENDING";
export const TRANSACTIONS_PUBLIC_SUCCESS = "TRANSACTIONS_PUBLIC_SUCCESS";
export const TRANSACTIONS_PUBLIC_ERROR = "TRANSACTIONS_PUBLIC_ERROR";
export const TRANSACTIONS_CONTACTS_PENDING = "TRANSACTIONS_CONTACTS_PENDING";
export const TRANSACTIONS_CONTACTS_SUCCESS = "TRANSACTIONS_CONTACTS_SUCCESS";
export const TRANSACTIONS_CONTACTS_ERROR = "TRANSACTIONS_CONTACTS_ERROR";
export const TRANSACTIONS_PERSONAL_PENDING = "TRANSACTIONS_PERSONAL_PENDING";
export const TRANSACTIONS_PERSONAL_SUCCESS = "TRANSACTIONS_PERSONAL_SUCCESS";
export const TRANSACTIONS_PERSONAL_ERROR = "TRANSACTIONS_PERSONAL_ERROR";

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

export type TTransactionActions =
  | ReturnType<typeof transactionsPublicPending>
  | ReturnType<typeof transactionsPublicSuccess>
  | ReturnType<typeof transactionsPublicError>
  | ReturnType<typeof transactionsContactsPending>
  | ReturnType<typeof transactionsContactsSuccess>
  | ReturnType<typeof transactionsContactsError>
  | ReturnType<typeof transactionsPersonalPending>
  | ReturnType<typeof transactionsPersonalSuccess>
  | ReturnType<typeof transactionsPersonalError>;

export type TransactionActionDataTypes = TTransactionActions["type"];
