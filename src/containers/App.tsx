import React from "react";
import { Switch, Route } from "react-router-dom";
import { useMachine, useService } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
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

const App: React.FC = () => {
  const classes = useStyles();
  const [authState] = useService(authService);

  // @ts-ignore
  if (window.Cypress) {
    // Expose authService on window for Cypress
    // @ts-ignore
    window.authService = authService;
  }

  const [, , notificationsService] = useMachine(notificationsMachine);

  const [, , snackbarService] = useMachine(snackbarMachine);

  const [, , bankAccountsService] = useMachine(bankAccountsMachine);

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
