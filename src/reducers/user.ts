import { TAppReducerActions, APP_BOOTSTRAP_SUCCESS } from "../actions/app";
import {
  TAuthActions,
  SIGNIN_SUCCESS,
  SIGNIN_ERROR,
  SIGNOUT_SUCCESS,
  SIGNOUT_ERROR
} from "../actions/auth";
import { USER_UPDATE_SUCCESS, TUsersActions } from "../actions/users";
import { User } from "../models";

export interface UserState {
  isLoggedIn: boolean;
  profile: User;
}

const initialState = {
  isLoggedIn: false,
  profile: {} as User
};

export default function reducer(
  state: UserState = initialState,
  action: TAuthActions | TAppReducerActions | TUsersActions
): UserState {
  switch (action.type) {
    case APP_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        profile: action.payload.user
      };
    case USER_UPDATE_SUCCESS:
      return {
        ...state,
        profile: {
          ...action.payload
        }
      };
    case SIGNIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true
      };
    case SIGNIN_ERROR:
    case SIGNOUT_SUCCESS:
    case SIGNOUT_ERROR:
      return {
        ...state,
        isLoggedIn: false,
        profile: {} as User
      };
    default:
      return state;
  }
}
