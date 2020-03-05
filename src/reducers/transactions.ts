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
import { isEmpty, isEqual, concat } from "lodash/fp";
import {
  omitDateQueryFields,
  omitAmountQueryFields
} from "../utils/transactionUtils";

export interface TransactionsState {
  meta: {
    isLoading: boolean;
  };
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
  meta: {
    isLoading: false
  },
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
        meta: {
          isLoading: true
        },
        filters:
          action.payload && !isEmpty(action.payload)
            ? action.payload
            : state.filters
      };
    case TRANSACTIONS_CLEAR_FILTERS: {
      if (isEqual("date", action.payload.filterType)) {
        return {
          ...state,
          filters: omitDateQueryFields(state.filters)
        };
      }

      if (isEqual("amount", action.payload.filterType)) {
        return {
          ...state,
          filters: omitAmountQueryFields(state.filters)
        };
      }

      return {
        ...state,
        filters: state.filters
      };
    }
    case TRANSACTIONS_PUBLIC_SUCCESS:
      return {
        ...state,
        meta: {
          isLoading: false
        },
        public: action.payload
      };
    case TRANSACTIONS_CONTACTS_SUCCESS:
      return {
        ...state,
        meta: {
          isLoading: false
        },
        contacts:
          action.payload.page > 1 && !isEmpty(state.contacts)
            ? concat(state.contacts, action.payload.transactions)
            : action.payload.transactions
      };
    case TRANSACTIONS_PERSONAL_SUCCESS:
      return {
        ...state,
        meta: {
          isLoading: false
        },
        personal: action.payload
      };
    case TRANSACTION_DETAIL_SUCCESS:
      return {
        ...state,
        meta: {
          isLoading: false
        },
        transactionDetails: action.payload
      };
    case SIGNOUT_SUCCESS:
    case SIGNOUT_ERROR:
      return {
        ...initialState
      };
    default:
      return state;
  }
}
