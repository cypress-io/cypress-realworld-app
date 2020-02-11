import {
  TBankAccountActions,
  BANKACCOUNTS_ALL_SUCCESS
} from "../actions/bankAccounts";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { BankAccount } from "../models";

export interface BankAccountsState {
  all: BankAccount[];
}

const initialState = {
  all: []
};

export default function reducer(
  state: BankAccountsState = initialState,
  action: TAuthActions | TBankAccountActions
): BankAccountsState {
  switch (action.type) {
    case BANKACCOUNTS_ALL_SUCCESS:
      return {
        ...state,
        all: action.payload
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
