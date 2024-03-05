import React, { useEffect } from "react";
import { useActor, useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import PrivateRoutesContainer from "./PrivateRoutesContainer";
import { Amplify, ResourcesConfig } from "aws-amplify";
import { fetchAuthSession, signInWithRedirect, signOut } from "aws-amplify/auth";

// @ts-ignore
import awsConfig from "../aws-exports";
Amplify.configure(awsConfig as ResourcesConfig);

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

  const isLoggedIn =
    authState.matches("authorized") ||
    authState.matches("refreshing") ||
    authState.matches("updating");

  useEffect(() => {
    if (!isLoggedIn) {
      fetchAuthSession().then((authSession) => {
        if (authSession && authSession.tokens && authSession.tokens.accessToken) {
          const { tokens, userSub } = authSession;
          authService.send("COGNITO", {
            accessTokenJwtString: tokens!.accessToken.toString(),
            userSub: userSub!,
            email: tokens!.idToken!.payload.email,
          });
        } else {
          void signInWithRedirect();
        }
      });
    }
  }, [isLoggedIn]);

  useEffect(() => {
    authService.onEvent(async (event) => {
      if (
        event.type === "done.invoke.performLogout" ||
        // we want the client-side app to discard its JWTs even if server-side errors out:
        event.type.startsWith("error.platform.authentication.logout")
      ) {
        console.log(
          "AppCognito authService.onEvent done.invoke.performLogout|error.platform.authentication.logout"
        );
        await signOut();
      }
    });
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={classes.root}>
      <CssBaseline />

      <PrivateRoutesContainer
        isLoggedIn={true}
        notificationsService={notificationsService}
        authService={authService}
        snackbarService={snackbarService}
        bankAccountsService={bankAccountsService}
      />

      <AlertBar snackbarService={snackbarService} />
    </div>
  );
};

export default AppCognito;
