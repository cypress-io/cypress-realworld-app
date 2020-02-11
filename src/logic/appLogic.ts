import { createLogic } from "redux-logic";
import { APP_BOOTSTRAP } from "../actions/app";
import { appBootstrapSuccess, appBootstrapError } from "../actions/app";
import {
  transactionsPublicPending,
  transactionsContactsPending,
  transactionsPersonalPending
} from "../actions/transactions";
import { signOutPending } from "../actions/auth";
import { usersAllPending } from "../actions/users";
import { notificationsAllPending } from "../actions/notifications";

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
      dispatch(transactionsContactsPending());
      dispatch(transactionsPersonalPending());
      dispatch(usersAllPending());
      dispatch(notificationsAllPending());
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
