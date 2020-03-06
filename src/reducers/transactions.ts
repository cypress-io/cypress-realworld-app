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
import { TransactionResponseItem, TransactionPagination } from "../models";
import { isEmpty, isEqual, concat, omit } from "lodash/fp";
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
  contacts: {
    pagination: TransactionPagination;
    data: TransactionResponseItem[];
  };
  personal: TransactionResponseItem[];
}

const paginationDefaults: TransactionPagination = {
  page: 1,
  limit: 10,
  hasNextPages: false,
  totalPages: 1
};

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
  contacts: {
    pagination: {
      ...paginationDefaults
    },
    data: []
  },
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
        contacts: {
          pagination: omit(
            "transactions",
            action.payload
          ) as TransactionPagination,
          data: concat(state.contacts.data, action.payload.transactions)
        }
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
