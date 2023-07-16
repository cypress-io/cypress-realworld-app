/* istanbul ignore next */
import React, { useEffect } from "react";
import { useActor, useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
// @ts-ignore
import { LoginCallback, SecureRoute, useOktaAuth, withOktaAuth } from "@okta/okta-react";
import { Route } from "react-router-dom";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
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

/* istanbul ignore next */
const AppOkta: React.FC = () => {
  const { authState: oktaAuthState, oktaAuth: oktaAuthService } = useOktaAuth();
  const classes = useStyles();
  const [authState] = useActor(authService);
  const [, , notificationsService] = useMachine(notificationsMachine);

  const [, , snackbarService] = useMachine(snackbarMachine);

  const [, , bankAccountsService] = useMachine(bankAccountsMachine);

  // @ts-ignore
  if (window.Cypress && process.env.VITE_OKTA_PROGRAMMATIC) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const okta = JSON.parse(localStorage.getItem("oktaCypress")!);
      authService.send("OKTA", {
        user: okta.user,
        token: okta.token,
      });
    }, []);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (oktaAuthState.isAuthenticated) {
        oktaAuthService.getUser().then((user: any) => {
          authService.send("OKTA", { user, token: oktaAuthState.accessToken });
        });
      }
    }, [oktaAuthState, oktaAuthService]);
  }

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
        <>
          <Route path="/implicit/callback" component={LoginCallback} />
          <SecureRoute exact path="/" />
        </>
      )}

      <AlertBar snackbarService={snackbarService} />
    </div>
  );
};

let appOkta =
  //@ts-ignore
  window.Cypress && process.env.VITE_OKTA_PROGRAMMATIC ? AppOkta : withOktaAuth(AppOkta);
export default appOkta;
