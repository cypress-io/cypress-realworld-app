import {
  TTransactionActions,
  TRANSACTIONS_PUBLIC_SUCCESS,
  TRANSACTIONS_PUBLIC_ERROR
} from "../actions/transactions";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { Transaction } from "../models";

export interface TransactionsState {
  public: Transaction[];
}

const initialState = {
  public: []
};

export default function reducer(
  state: TransactionsState = initialState,
  action: TTransactionActions | TAuthActions
): TransactionsState {
  switch (action.type) {
    case TRANSACTIONS_PUBLIC_SUCCESS:
      return {
        ...state,
        public: action.payload.transactions
      };
    case TRANSACTIONS_PUBLIC_ERROR:
    case SIGNOUT_SUCCESS:
    case SIGNOUT_ERROR:
      return {
        ...state,
        public: []
      };
    default:
      return state;
  }
}
