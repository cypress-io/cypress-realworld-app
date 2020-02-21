import {
  TTransactionActions,
  TRANSACTIONS_PUBLIC_SUCCESS,
  TRANSACTIONS_CONTACTS_SUCCESS,
  TRANSACTIONS_PERSONAL_SUCCESS,
  TRANSACTION_DETAIL_SUCCESS,
  TRANSACTIONS_PERSONAL_PENDING,
  TRANSACTIONS_CONTACTS_PENDING,
  TRANSACTIONS_PUBLIC_PENDING,
  TRANSACTIONS_CLEAR_FILTERS
} from "../actions/transactions";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { TransactionResponseItem } from "../models";
import { isEmpty, isEqual } from "lodash/fp";
import { omitDateQueryFields } from "../utils/transactionUtils";

export interface TransactionsState {
  filters: object;
  transactionDetails?: TransactionResponseItem;
  public: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
  contacts: TransactionResponseItem[];
  personal: TransactionResponseItem[];
}

const initialState = {
  filters: {},
  transactionDetails: undefined,
  public: {
    contacts: [],
    public: []
  },
  contacts: [],
  personal: []
};

export default function reducer(
  state: TransactionsState = initialState,
  action: TTransactionActions | TAuthActions
): TransactionsState {
  switch (action.type) {
    case TRANSACTIONS_PERSONAL_PENDING:
    case TRANSACTIONS_CONTACTS_PENDING:
    case TRANSACTIONS_PUBLIC_PENDING:
      return {
        ...state,
        filters:
          action.payload && !isEmpty(action.payload)
            ? action.payload
            : state.filters
      };
    case TRANSACTIONS_CLEAR_FILTERS:
      return {
        ...state,
        filters: isEqual("date", action.payload.filterType)
          ? omitDateQueryFields(state.filters)
          : state.filters
      };
    case TRANSACTIONS_PUBLIC_SUCCESS:
      return {
        ...state,
        public: action.payload
      };
    case TRANSACTIONS_CONTACTS_SUCCESS:
      return {
        ...state,
        contacts: action.payload
      };
    case TRANSACTIONS_PERSONAL_SUCCESS:
      return {
        ...state,
        personal: action.payload
      };
    case TRANSACTION_DETAIL_SUCCESS:
      return {
        ...state,
        transactionDetails: action.payload
      };
    case SIGNOUT_SUCCESS:
    case SIGNOUT_ERROR:
      return {
        ...state,
        public: {
          contacts: [],
          public: []
        }
      };
    default:
      return state;
  }
}
