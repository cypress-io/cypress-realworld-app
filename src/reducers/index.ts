import { combineReducers } from "redux";
import app from "./app";
import user from "./user";

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
