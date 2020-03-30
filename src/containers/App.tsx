import React from "react";
import { Switch, Route } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authMachine } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import PrivateRoutesContainer from "./PrivateRoutesContainer";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
}));

const savedAuthState = localStorage.getItem("authState");

const persistedAuthState = savedAuthState && JSON.parse(savedAuthState);

const App: React.FC = () => {
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [authState, sendAuth, authService] = useMachine(authMachine, {
    state: persistedAuthState,
    devTools: true,
  });
  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    notificationsState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendNotifications,
    notificationsService,
  ] = useMachine(notificationsMachine, {
    devTools: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [snackbarState, sendSnackbar, snackbarService] = useMachine(
    snackbarMachine,
    {
      devTools: true,
    }
  );

  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bankAccountsState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendBankAccounts,
    bankAccountsService,
  ] = useMachine(bankAccountsMachine, { devTools: true });

  const isLoggedIn =
    authState.matches("authorized") ||
    authState.matches("refreshing") ||
    authState.matches("updating");

  return (
    <div className={classes.root}>
      <CssBaseline />

      {isLoggedIn && (
        <PrivateRoutesContainer
          notificationsService={notificationsService}
          authService={authService}
          snackbarService={snackbarService}
          bankAccountsService={bankAccountsService}
        />
      )}
      {authState.matches("unauthorized") && (
        <Switch>
          <Route path="/signup">
            <SignUpForm authService={authService} />
          </Route>
          <Route path="/(signin)?">
            <SignInForm authService={authService} />
          </Route>
        </Switch>
      )}

      <AlertBar snackbarService={snackbarService} />
    </div>
  );
};

export default App;
