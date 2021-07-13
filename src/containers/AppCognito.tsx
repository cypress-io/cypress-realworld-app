import React, { useEffect } from "react";
import { useService, useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline, Container } from "@material-ui/core";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import PrivateRoutesContainer from "./PrivateRoutesContainer";
import Amplify, { Auth } from "aws-amplify";
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";

// @ts-ignore
import awsConfig from "../aws-exports";

Amplify.configure(awsConfig);

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

const AppCognito: React.FC = /* istanbul ignore next */ () => {
  const classes = useStyles();
  const [authState] = useService(authService);
  const [, , notificationsService] = useMachine(notificationsMachine);

  const [, , snackbarService] = useMachine(snackbarMachine);

  const [, , bankAccountsService] = useMachine(bankAccountsMachine);

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      console.log("authData: ", authData);
      if (nextAuthState === AuthState.SignedIn) {
        authService.send("COGNITO", { user: authData });
      }
    });
  }, []);

  useEffect(() => {
    authService.onEvent(async (event) => {
      if (event.type === "done.invoke.performLogout") {
        console.log("AppCognito authService.onEvent done.invoke.performLogout");
        await Auth.signOut();
      }
    });
  }, []);

  const isLoggedIn =
    authState.matches("authorized") ||
    authState.matches("refreshing") ||
    authState.matches("updating");

  return isLoggedIn ? (
    <div className={classes.root}>
      <CssBaseline />

      <PrivateRoutesContainer
        isLoggedIn={isLoggedIn}
        notificationsService={notificationsService}
        authService={authService}
        snackbarService={snackbarService}
        bankAccountsService={bankAccountsService}
      />

      <AlertBar snackbarService={snackbarService} />
    </div>
  ) : (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <AmplifyAuthenticator usernameAlias="email">
        <AmplifySignUp slot="sign-up" usernameAlias="email" />
        <AmplifySignIn slot="sign-in" usernameAlias="email" />
      </AmplifyAuthenticator>
    </Container>
  );
};

export default AppCognito;
