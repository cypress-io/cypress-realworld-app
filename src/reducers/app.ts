import { EAppActionTypes } from "./";
import { TAppReducerActions } from "../actions/app";
import { AppState } from "../models";

const initialState = {
  isBootstrapped: false,
  isLoggedIn: false
};

export default function reducer(
  state: AppState = initialState,
  action: TAppReducerActions
) {
  switch (action.type) {
    case EAppActionTypes.APP_BOOTSTRAP:
      return {
        ...state
      };
    case EAppActionTypes.APP_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        isBootstrapped: true,
        isLoggedIn: true
      };
    case EAppActionTypes.APP_BOOTSTRAP_ERROR:
      return {
        ...state,
        isBootstrapped: false,
        isLoggedIn: false
      };
    default:
      return state;
  }
}
