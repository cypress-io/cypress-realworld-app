/* istanbul ignore next */
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
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

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
const AppAuth0: React.FC = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const classes = useStyles();
  const [authState] = useActor(authService);
  const [, , notificationsService] = useMachine(notificationsMachine);

  const [, , snackbarService] = useMachine(snackbarMachine);

  const [, , bankAccountsService] = useMachine(bankAccountsMachine);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    (async function waitForToken() {
      const token = await getAccessTokenSilently();
      authService.send("AUTH0", { user, token });
    })();
  }, [isAuthenticated, user, getAccessTokenSilently]);

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

      <AlertBar snackbarService={snackbarService} />
    </div>
  );
};

const appAuth0 = withAuthenticationRequired(AppAuth0);
export default appAuth0;
