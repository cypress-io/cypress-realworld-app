import { EAppActionTypes, ESignInActionTypes } from "./";
import { TAppReducerActions } from "../actions/app";
import { TSignInReducerActions } from "../actions/signin";
import { User } from "../models";

interface UserState {
  profile?: User;
}

const initialState = {
  profile: undefined
};

export default function reducer(
  state: UserState = initialState,
  action: TSignInReducerActions | TAppReducerActions
) {
  switch (action.type) {
    case EAppActionTypes.APP_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        profile: action.payload.user
      };
    case ESignInActionTypes.SIGNIN_ERROR:
      return {
        ...state,
        profile: undefined
      };
    default:
      return state;
  }
}
