import {
  TTransactionActions,
  TRANSACTIONS_PUBLIC_SUCCESS,
  TRANSACTIONS_PUBLIC_ERROR
} from "../actions/transactions";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { TransactionResponseItem } from "../models";

export interface TransactionsState {
  public: {
    contacts: TransactionResponseItem[];
    public: TransactionResponseItem[];
  };
}

const initialState = {
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
    case TRANSACTIONS_PUBLIC_SUCCESS:
      return {
        ...state,
        public: action.payload
      };
    case TRANSACTIONS_PUBLIC_ERROR:
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
