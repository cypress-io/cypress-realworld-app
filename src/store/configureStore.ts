import axios from "axios";
import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import { createLogicMiddleware } from "redux-logic";
import rootReducer from "../reducers";
import logic from "../logic";

const persistConfig = {
  key: "root",
  storage
};

const logicDeps = {
  httpClient: axios.create({ withCredentials: true })
};

// @ts-ignore
const middlewares = [createLogicMiddleware(logic, logicDeps)];

if (process.env.NODE_ENV === `development`) {
  const { logger } = require(`redux-logger`);

  middlewares.push(logger);
}

const enhancer = composeWithDevTools(applyMiddleware(...middlewares));

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default function configureStore(initialState: object) {
  const store = createStore(persistedReducer, initialState, enhancer);

  const persistor = persistStore(store);

  if (module.hot) {
    module.hot.accept("../reducers", () =>
      store.replaceReducer(require("../reducers").default)
    );
  }

  return { store, persistor };
}
