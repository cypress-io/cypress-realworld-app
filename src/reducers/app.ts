import {
  TAppReducerActions,
  APP_BOOTSTRAP_PENDING,
  APP_BOOTSTRAP_SUCCESS,
  APP_BOOTSTRAP_ERROR
} from "../actions/app";
import { TSignInReducerActions } from "../actions/auth";
import { AppState } from "../models";

const initialState = {
  isBootstrapped: false
};

export default function reducer(
  state: AppState = initialState,
  action: TAppReducerActions | TSignInReducerActions
) {
  switch (action.type) {
    case APP_BOOTSTRAP_PENDING:
      return {
        ...state,
        isBootstrapped: false
      };
    case APP_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        isBootstrapped: true
      };
    case APP_BOOTSTRAP_ERROR:
      return {
        ...state,
        isBootstrapped: false
      };
    default:
      return state;
  }
}
