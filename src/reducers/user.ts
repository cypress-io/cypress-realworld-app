import { EAppActionTypes, ESignInActionTypes } from "./";
import { TAppReducerActions } from "../actions/app";
import { TSignInReducerActions } from "../actions/auth";
import { User } from "../models";

export interface UserState {
  isLoggedIn: boolean;
  profile?: User;
}

const initialState = {
  isLoggedIn: false,
  profile: undefined
};

export default function reducer(
  state: UserState = initialState,
  action: TSignInReducerActions | TAppReducerActions
): UserState {
  switch (action.type) {
    case EAppActionTypes.APP_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        profile: action.payload.user
      };
    case ESignInActionTypes.SIGNIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true
      };
    case ESignInActionTypes.SIGNIN_ERROR:
      return {
        ...state,
        isLoggedIn: false,
        profile: undefined
      };
    default:
      return state;
  }
}
