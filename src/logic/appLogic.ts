import { createLogic } from "redux-logic";
import {
  APP_BOOTSTRAP,
  APP_SNACKBAR_INIT,
  APP_SNACKBAR_RESET
} from "../actions/app";
import {
  appBootstrapSuccess,
  appBootstrapError,
  appSnackBarReset
} from "../actions/app";
import {
  transactionsPublicPending,
  transactionsContactsPending,
  transactionsPersonalPending
} from "../actions/transactions";
import { signOutPending } from "../actions/auth";
import { usersAllPending } from "../actions/users";
import { notificationsAllPending } from "../actions/notifications";
import { bankAccountsAllPending } from "../actions/bankaccounts";

const appBootstrapLogic = createLogic({
  type: APP_BOOTSTRAP,
  latest: true,

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
      dispatch(bankAccountsAllPending());
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

const appSnackBarResetLogic = createLogic({
  type: APP_SNACKBAR_RESET,
  throttle: 4000,
  validate({ action }, allow) {
    setTimeout(() => {
      allow(action);
    }, 4000);
  }
});

const appSnackBarInitLogic = createLogic({
  type: APP_SNACKBAR_INIT,

  // @ts-ignore
  // eslint-disable-next-line no-empty-pattern
  async process({}, dispatch, done) {
    dispatch(appSnackBarReset());
    done();
  }
});

export default [appBootstrapLogic, appSnackBarResetLogic, appSnackBarInitLogic];
