import { BankAccount, BankAccountPayload } from "../models";

export const BANKACCOUNTS_ALL_PENDING = "BANKACCOUNTS_ALL_PENDING";
export const BANKACCOUNTS_ALL_SUCCESS = "BANKACCOUNTS_ALL_SUCCESS";
export const BANKACCOUNTS_ALL_ERROR = "BANKACCOUNTS_ALL_ERROR";
export const BANKACCOUNT_DETAIL_PENDING = "BANKACCOUNT_DETAIL_PENDING";
export const BANKACCOUNT_DETAIL_SUCCESS = "BANKACCOUNT_DETAIL_SUCCESS";
export const BANKACCOUNT_DETAIL_ERROR = "BANKACCOUNTS_DETAIL_ERROR";
export const BANKACCOUNT_CREATE_PENDING = "BANKACCOUNT_CREATE_PENDING";
export const BANKACCOUNT_CREATE_SUCCESS = "BANKACCOUNT_CREATE_SUCCESS";
export const BANKACCOUNT_CREATE_ERROR = "BANKACCOUNT_CREATE_ERROR";
export const BANKACCOUNT_DELETE_PENDING = "BANKACCOUNT_DELETE_PENDING";
export const BANKACCOUNT_DELETE_SUCCESS = "BANKACCOUNT_DELETE_SUCCESS";
export const BANKACCOUNT_DELETE_ERROR = "BANKACCOUNT_DELETE_ERROR";

export const bankAccountsAllPending = () =>
  ({
    type: BANKACCOUNTS_ALL_PENDING
  } as const);

export const bankAccountsAllSuccess = (payload: any) =>
  ({
    type: BANKACCOUNTS_ALL_SUCCESS,
    payload
  } as const);

export const bankAccountsAllError = (payload: any) =>
  ({
    type: BANKACCOUNTS_ALL_ERROR,
    payload,
    error: true
  } as const);

export const bankAccountDetailPending = (payload: object) =>
  ({
    type: BANKACCOUNT_DETAIL_PENDING,
    payload
  } as const);

export const bankAccountDetailSuccess = (payload: any) =>
  ({
    type: BANKACCOUNT_DETAIL_SUCCESS,
    payload
  } as const);

export const bankAccountDetailError = (payload: any) =>
  ({
    type: BANKACCOUNT_DETAIL_ERROR,
    payload,
    error: true
  } as const);

export const bankAccountCreatePending = (payload: object) =>
  ({
    type: BANKACCOUNT_CREATE_PENDING,
    payload
  } as const);

export const bankAccountCreateSuccess = (payload: {
  bankAccount: BankAccount;
}) =>
  ({
    type: BANKACCOUNT_CREATE_SUCCESS,
    payload
  } as const);

export const bankAccountCreateError = (payload: any) =>
  ({
    type: BANKACCOUNT_CREATE_ERROR,
    payload,
    error: true
  } as const);

export const bankAccountDeletePending = (payload: BankAccountPayload) =>
  ({
    type: BANKACCOUNT_DELETE_PENDING,
    payload
  } as const);

export const bankAccountDeleteSuccess = (payload: {
  bankAccount: BankAccount;
}) =>
  ({
    type: BANKACCOUNT_DELETE_SUCCESS,
    payload
  } as const);

export const bankAccountDeleteError = (payload: any) =>
  ({
    type: BANKACCOUNT_DELETE_ERROR,
    payload,
    error: true
  } as const);

export type TBankAccountActions =
  | ReturnType<typeof bankAccountsAllPending>
  | ReturnType<typeof bankAccountsAllSuccess>
  | ReturnType<typeof bankAccountsAllError>
  | ReturnType<typeof bankAccountDetailPending>
  | ReturnType<typeof bankAccountDetailSuccess>
  | ReturnType<typeof bankAccountDetailError>
  | ReturnType<typeof bankAccountCreatePending>
  | ReturnType<typeof bankAccountCreateSuccess>
  | ReturnType<typeof bankAccountCreateError>
  | ReturnType<typeof bankAccountDeletePending>
  | ReturnType<typeof bankAccountDeleteSuccess>
  | ReturnType<typeof bankAccountDeleteError>;

export type BankAccountActionDataTypes = TBankAccountActions["type"];
