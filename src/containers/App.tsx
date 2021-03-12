import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useService, useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core";
import { CssBaseline } from "@material-ui/core";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import PrivateRoutesContainer from "./PrivateRoutesContainer";

// @ts-ignore
if (window.Cypress) {
  // Expose authService on window for Cypress
  // @ts-ignore
  window.authService = authService;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [authState] = useService(authService);
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
          isLoggedIn={isLoggedIn}
          notificationsService={notificationsService}
          authService={authService}
          snackbarService={snackbarService}
          bankAccountsService={bankAccountsService}
        />
      )}
      {authState.matches("unauthorized") && (
        <Switch>
          <Route exact path="/signup">
            <SignUpForm authService={authService} />
          </Route>
          <Route exact path="/signin">
            <SignInForm authService={authService} />
          </Route>
          <Route path="/*">
            <Redirect
              to={{
                pathname: "/signin",
              }}
            />
          </Route>
        </Switch>
      )}
      <AlertBar snackbarService={snackbarService} />
    </div>
  );
};

export default App;
