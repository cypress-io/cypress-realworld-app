import { combineReducers } from "redux";
import app from "./app";
import user from "./user";

const rootReducer = combineReducers({
  app,
  user
});

export type IRootReducerState = ReturnType<typeof rootReducer>;

export default rootReducer;
