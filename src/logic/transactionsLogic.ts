import { createLogic } from "redux-logic";
import {
  TRANSACTIONS_PUBLIC_PENDING,
  TRANSACTIONS_PUBLIC_SUCCESS,
  TRANSACTIONS_PUBLIC_ERROR,
  TRANSACTIONS_CONTACTS_PENDING,
  TRANSACTIONS_CONTACTS_SUCCESS,
  TRANSACTIONS_CONTACTS_ERROR
} from "../actions/transactions";

const transactionsPublicLogic = createLogic({
  type: TRANSACTIONS_PUBLIC_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: TRANSACTIONS_PUBLIC_SUCCESS,
    failType: TRANSACTIONS_PUBLIC_ERROR
  },

  // @ts-ignore
  process({ httpClient }) {
    return httpClient
      .get(`http://localhost:3001/transactions/public`)
      .then((resp: any) => resp.data.transactions);
  }
});

const transactionsContactsLogic = createLogic({
  type: TRANSACTIONS_CONTACTS_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: TRANSACTIONS_CONTACTS_SUCCESS,
    failType: TRANSACTIONS_CONTACTS_ERROR
  },

  // @ts-ignore
  process({ httpClient }) {
    return httpClient
      .get(`http://localhost:3001/transactions/contacts`)
      .then((resp: any) => resp.data.transactions);
  }
});

export default [transactionsPublicLogic, transactionsContactsLogic];
