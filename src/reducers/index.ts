import { combineReducers } from "redux";
import app from "./app";

export enum EAppActionTypes {
  APP_BOOTSTRAP = "APP_BOOTSTRAP",
  APP_BOOTSTRAP_PENDING = "APP_BOOTSTRAP_PENDING",
  APP_BOOTSTRAP_SUCCESS = "APP_BOOTSTRAP_SUCCESS",
  APP_BOOTSTRAP_ERROR = "APP_BOOTSTRAP_ERROR"
}

const rootReducer = combineReducers({
  app
});

export type IAppState = ReturnType<typeof rootReducer>;

export default rootReducer;
