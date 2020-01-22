import { EAppActionTypes, ESignInActionTypes } from "./";
import { TAppReducerActions } from "../actions/app";
import { TSignInReducerActions } from "../actions/signin";
import { AppState } from "../models";

const initialState = {
  isBootstrapped: false,
  isLoggedIn: false
};

export default function reducer(
  state: AppState = initialState,
  action: TAppReducerActions | TSignInReducerActions
) {
  switch (action.type) {
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
    case ESignInActionTypes.SIGNIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true
      };
    case ESignInActionTypes.SIGNIN_ERROR:
      return {
        ...state,
        isLoggedIn: false
      };
    default:
      return state;
  }
}
