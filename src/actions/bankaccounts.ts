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
export const BANKACCOUNT_UPDATE_PENDING = "BANKACCOUNT_UPDATE_PENDING";
export const BANKACCOUNT_UPDATE_SUCCESS = "BANKACCOUNT_UPDATE_SUCCESS";
export const BANKACCOUNT_UPDATE_ERROR = "BANKACCOUNT_UPDATE_ERROR";

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

export const bankAccountUpdatePending = (payload: BankAccountPayload) =>
  ({
    type: BANKACCOUNT_UPDATE_PENDING,
    payload
  } as const);

export const bankAccountUpdateSuccess = (payload: {
  bankAccount: BankAccount;
}) =>
  ({
    type: BANKACCOUNT_UPDATE_SUCCESS,
    payload
  } as const);

export const bankAccountUpdateError = (payload: any) =>
  ({
    type: BANKACCOUNT_UPDATE_ERROR,
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
  | ReturnType<typeof bankAccountUpdatePending>
  | ReturnType<typeof bankAccountUpdateSuccess>
  | ReturnType<typeof bankAccountUpdateError>;

export type BankAccountActionDataTypes = TBankAccountActions["type"];
