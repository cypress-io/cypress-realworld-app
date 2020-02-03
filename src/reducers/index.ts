import { combineReducers } from "redux";
import app from "./app";
import user from "./user";
import users from "./users";
import transactions from "./transactions";

const rootReducer = combineReducers({
  app,
  user,
  transactions,
  users
});

export type IRootReducerState = ReturnType<typeof rootReducer>;

export default rootReducer;
