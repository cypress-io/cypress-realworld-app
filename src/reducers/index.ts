import { combineReducers } from "redux";
import app from "./app";
import user from "./user";
import transactions from "./transactions";

const rootReducer = combineReducers({
  app,
  user,
  transactions
});

export type IRootReducerState = ReturnType<typeof rootReducer>;

export default rootReducer;
