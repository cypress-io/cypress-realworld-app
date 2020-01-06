import axios from "axios";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import { createLogicMiddleware } from "redux-logic";
import rootReducer from "../reducers";
import logic from "../logic";

const logicDeps = {
  httpClient: axios.create({ withCredentials: true })
};

const middlewares = [createLogicMiddleware(logic, logicDeps)];

if (process.env.NODE_ENV === `development`) {
  const { logger } = require(`redux-logger`);

  middlewares.push(logger);
}

const enhancer = composeWithDevTools(applyMiddleware(...middlewares));

export default function configureStore(initialState: object) {
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept("../reducers", () =>
      store.replaceReducer(require("../reducers").default)
    );
  }

  return store;
}
