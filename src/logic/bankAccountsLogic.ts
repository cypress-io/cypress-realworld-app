import { createLogic } from "redux-logic";
import {
  BANKACCOUNTS_ALL_PENDING,
  BANKACCOUNTS_ALL_SUCCESS,
  BANKACCOUNTS_ALL_ERROR,
  bankAccountsAllPending,
  BANKACCOUNT_DETAIL_PENDING,
  BANKACCOUNT_DETAIL_SUCCESS,
  BANKACCOUNT_DETAIL_ERROR,
  bankAccountDetailPending,
  BANKACCOUNT_CREATE_PENDING,
  BANKACCOUNT_CREATE_SUCCESS,
  BANKACCOUNT_CREATE_ERROR,
  BANKACCOUNT_DELETE_PENDING,
  BANKACCOUNT_DELETE_SUCCESS,
  BANKACCOUNT_DELETE_ERROR
} from "../actions/bankaccounts";
import { history } from "../index";
import {
  isNewBankAccountPath,
  pathBankAccountId
} from "../utils/transactionUtils";

const bankAccountsAllLogic = createLogic({
  type: BANKACCOUNTS_ALL_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: BANKACCOUNTS_ALL_SUCCESS,
    failType: BANKACCOUNTS_ALL_ERROR
  },

  // @ts-ignore
  process({ httpClient }) {
    return httpClient
      .get(`http://localhost:3001/bankAccounts`)
      .then((resp: any) => resp.data.accounts);
  }
});

const bankAccountDetailLogic = createLogic({
  type: BANKACCOUNT_DETAIL_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: BANKACCOUNT_DETAIL_SUCCESS,
    failType: BANKACCOUNT_DETAIL_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    // @ts-ignore
    const { payload } = action;

    history.push(`/bankAccount/${payload.bankAccountId}`);

    return httpClient
      .get(`http://localhost:3001/bankAccounts/${payload.bankAccountId}`)
      .then((resp: any) => resp.data.bankAccount);
  }
});

const bankAccountCreateLogic = createLogic({
  type: BANKACCOUNT_CREATE_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: BANKACCOUNT_CREATE_SUCCESS,
    failType: BANKACCOUNT_CREATE_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    return (
      httpClient
        // @ts-ignore
        .post("http://localhost:3001/bankAccounts", action.payload)
        .then((resp: any) => resp.data)
    );
  }
});

const bankAccountsRefreshLogic = createLogic({
  type: [BANKACCOUNT_CREATE_SUCCESS, BANKACCOUNT_DELETE_SUCCESS],

  // @ts-ignore
  // eslint-disable-next-line no-empty-pattern
  process({}, dispatch, done) {
    const { pathname } = window.location;

    if (isNewBankAccountPath(pathname)) {
      history.push("/bankaccounts");
    }

    const bankAccountId = pathBankAccountId(pathname);
    if (bankAccountId) {
      dispatch(
        bankAccountDetailPending({
          bankAccountId
        })
      );
    }

    dispatch(bankAccountsAllPending());
    done();
  }
});

const bankAccountDeleteLogic = createLogic({
  type: BANKACCOUNT_DELETE_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: BANKACCOUNT_DELETE_SUCCESS,
    failType: BANKACCOUNT_DELETE_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    // @ts-ignore
    const { payload } = action;

    return (
      httpClient
        // @ts-ignore
        .delete(`http://localhost:3001/bankAccounts/${payload.id}`, payload)
        .then((resp: any) => resp.data)
    );
  }
});

export default [
  bankAccountsAllLogic,
  bankAccountDetailLogic,
  bankAccountCreateLogic,
  bankAccountsRefreshLogic,
  bankAccountDeleteLogic
];
