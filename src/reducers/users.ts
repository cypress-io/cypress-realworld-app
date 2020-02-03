import {
  TUsersActions,
  USERS_ALL_SUCCESS,
  USERS_SEARCH_SUCCESS
} from "../actions/users";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { User } from "../models";

export interface UsersState {
  all: User[];
  search: User[];
}

const initialState = {
  all: [],
  search: []
};

export default function reducer(
  state: UsersState = initialState,
  action: TAuthActions | TUsersActions
): UsersState {
  switch (action.type) {
    case USERS_ALL_SUCCESS:
      return {
        ...state,
        all: action.payload
      };
    case USERS_SEARCH_SUCCESS:
      return {
        ...state,
        search: action.payload
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
