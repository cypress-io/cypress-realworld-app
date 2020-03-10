import {
  TTransactionActions,
  TRANSACTION_DETAIL_SUCCESS
} from "../actions/transactions";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { TransactionResponseItem } from "../models";

export interface TransactionsState {
  meta: {
    isLoading: boolean;
  };
  transactionDetails?: TransactionResponseItem;
}

const initialState = {
  meta: {
    isLoading: false
  },
  transactionDetails: undefined
};

export default function reducer(
  state: TransactionsState = initialState,
  action: TTransactionActions | TAuthActions
): TransactionsState {
  switch (action.type) {
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
