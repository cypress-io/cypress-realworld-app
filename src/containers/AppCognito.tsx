import React, { useEffect } from "react";
import { useActor, useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline, Container } from "@material-ui/core";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import PrivateRoutesContainer from "./PrivateRoutesContainer";
import { Amplify } from "aws-amplify";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";

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
  const [authState] = useActor(authService);
  const [, , notificationsService] = useMachine(notificationsMachine);

  const [, , snackbarService] = useMachine(snackbarMachine);

  const [, , bankAccountsService] = useMachine(bankAccountsMachine);

  const { route, signOut, user } = useAuthenticator();

  useEffect(() => {
    console.log("auth route: ", route);
    if (route === "authenticated") {
      authService.send("COGNITO", { user });
    }
  }, [route, user]);

  useEffect(() => {
    authService.onEvent(async (event) => {
      if (event.type === "done.invoke.performLogout") {
        console.log("AppCognito authService.onEvent done.invoke.performLogout");
        await signOut();
      }
    });
  }, [signOut]);

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
      <Authenticator>
        {({ signOut, user }) => (
          <main>
            <h1>Hello {user?.username}</h1>
            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
    </Container>
  );
};

export default AppCognito;
