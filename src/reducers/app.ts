import { EAppActionTypes } from "./";
import { TAppReducerActions } from "../actions/app";
import { TSignInReducerActions } from "../actions/signin";
import { AppState } from "../models";

const initialState = {
  isBootstrapped: false
};

export default function reducer(
  state: AppState = initialState,
  action: TAppReducerActions | TSignInReducerActions
) {
  switch (action.type) {
    case EAppActionTypes.APP_BOOTSTRAP_PENDING:
      return {
        ...state,
        isBootstrapped: false
      };
    case EAppActionTypes.APP_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        isBootstrapped: true
      };
    case EAppActionTypes.APP_BOOTSTRAP_ERROR:
      return {
        ...state,
        isBootstrapped: false
      };
    default:
      return state;
  }
}
