import {
  TTransactionActions,
  TRANSACTIONS_PUBLIC_SUCCESS,
  TRANSACTION_DETAIL_SUCCESS,
  TRANSACTIONS_PUBLIC_PENDING,
  TRANSACTIONS_CLEAR_FILTERS
} from "../actions/transactions";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { TransactionResponseItem } from "../models";
import { isEmpty, isEqual, omit } from "lodash/fp";
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
  }
};

export default function reducer(
  state: TransactionsState = initialState,
  action: TTransactionActions | TAuthActions
): TransactionsState {
  switch (action.type) {
    case TRANSACTIONS_PUBLIC_PENDING: {
      const sanitizedPayload = omit("page", action.payload);

      return {
        ...state,
        meta: {
          isLoading: true
        },
        filters:
          sanitizedPayload && !isEmpty(sanitizedPayload)
            ? sanitizedPayload
            : state.filters
      };
    }
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
