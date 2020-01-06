import { combineReducers } from "redux";
import app from "./app";

export enum EAppActionTypes {
  APP_BOOTSTRAP = "APP_BOOTSTRAP",
  APP_DATA_PENDING = "APP_DATA_PENDING",
  APP_DATA_SUCCESS = "APP_DATA_SUCCESS",
  APP_DATA_ERROR = "APP_DATA_ERROR"
}

const rootReducer = combineReducers({
  app
});

export type IAppState = ReturnType<typeof rootReducer>;

export default rootReducer;
