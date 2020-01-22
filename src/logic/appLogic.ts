import { createLogic } from "redux-logic";
import { EAppActionTypes } from "../reducers";
import { appBootstrapSuccess, appBootstrapError } from "../actions/app";

const appBootstrapLogic = createLogic({
  type: EAppActionTypes.APP_BOOTSTRAP,

  // @ts-ignore
  async process({ httpClient }, dispatch, done) {
    let checkAuth;

    try {
      checkAuth = await httpClient.get(`http://localhost:3001/checkAuth`);

      // additional async
      // e.g. transactions, etc

      const { user } = checkAuth.data;

      dispatch(appBootstrapSuccess({ user }));
    } catch (error) {
      // @ts-ignore
      dispatch(appBootstrapError({ error: "Unauthorized" }));
    }

    done();
  }
});

export default appBootstrapLogic;
