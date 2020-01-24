import { createLogic } from "redux-logic";
import { APP_BOOTSTRAP } from "../actions/app";
import { appBootstrapSuccess, appBootstrapError } from "../actions/app";
import { transactionsPublicPending } from "../actions/transactions";
import { signOutPending } from "../actions/auth";

const appBootstrapLogic = createLogic({
  type: APP_BOOTSTRAP,

  // @ts-ignore
  async process({ httpClient }, dispatch, done) {
    let checkAuth;

    try {
      checkAuth = await httpClient.get(`http://localhost:3001/checkAuth`);

      // additional async
      // e.g. transactions, etc

      const { user } = checkAuth.data;

      dispatch(appBootstrapSuccess({ user }));
      dispatch(transactionsPublicPending());
    } catch (error) {
      // @ts-ignore
      dispatch(appBootstrapError({ error: "Unauthorized" }));
      const { pathname } = window.location;
      if (!pathname.match("signin|signup")) {
        dispatch(signOutPending());
      }
    }

    done();
  }
});

export default appBootstrapLogic;
