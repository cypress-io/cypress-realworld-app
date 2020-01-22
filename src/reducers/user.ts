import { ESignInActionTypes } from "./";
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
  action: TSignInReducerActions
) {
  switch (action.type) {
    case ESignInActionTypes.SIGNIN_SUCCESS:
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
