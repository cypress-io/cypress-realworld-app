import { combineReducers } from "redux";
import app from "./app";
import user from "./user";

export enum EAppActionTypes {
  APP_BOOTSTRAP = "APP_BOOTSTRAP",
  APP_BOOTSTRAP_PENDING = "APP_BOOTSTRAP_PENDING",
  APP_BOOTSTRAP_SUCCESS = "APP_BOOTSTRAP_SUCCESS",
  APP_BOOTSTRAP_ERROR = "APP_BOOTSTRAP_ERROR"
}

export enum ESignInActionTypes {
  SIGNIN_PENDING = "SIGNIN_PENDING",
  SIGNIN_SUCCESS = "SIGNIN_SUCCESS",
  SIGNIN_ERROR = "SIGNIN_ERROR"
}

const rootReducer = combineReducers({
  app,
  user
});

export type IAppState = ReturnType<typeof rootReducer>;

export default rootReducer;
