import { TAppReducerActions, APP_BOOTSTRAP_SUCCESS } from "../actions/app";
import { TAuthActions, SIGNIN_SUCCESS, SIGNIN_ERROR } from "../actions/auth";
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
  action: TAuthActions | TAppReducerActions
): UserState {
  switch (action.type) {
    case APP_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        profile: action.payload.user
      };
    case SIGNIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true
      };
    case SIGNIN_ERROR:
      return {
        ...state,
        isLoggedIn: false,
        profile: undefined
      };
    default:
      return state;
  }
}
