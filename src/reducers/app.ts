import {
  TAppReducerActions,
  APP_BOOTSTRAP_PENDING,
  APP_BOOTSTRAP_SUCCESS,
  APP_BOOTSTRAP_ERROR,
  APP_SNACKBAR_INIT,
  APP_SNACKBAR_RESET
} from "../actions/app";
import { SIGNOUT_SUCCESS, SIGNOUT_ERROR, TAuthActions } from "../actions/auth";

export interface AppState {
  isBootstrapped: boolean;
  snackbar: object;
}

const initialState = {
  isBootstrapped: false,
  snackbar: {
    message: "",
    severity: ""
  }
};

export default function reducer(
  state: AppState = initialState,
  action: TAppReducerActions | TAuthActions
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
    case APP_SNACKBAR_INIT:
      return {
        ...state,
        snackbar: action.payload
      };
    case APP_SNACKBAR_RESET:
      return {
        ...state,
        snackbar: {
          message: "",
          severity: ""
        }
      };
    case APP_BOOTSTRAP_ERROR:
    case SIGNOUT_SUCCESS:
    case SIGNOUT_ERROR:
      return {
        ...state,
        isBootstrapped: false
      };
    default:
      return state;
  }
}
