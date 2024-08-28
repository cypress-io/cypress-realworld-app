import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useActor, useMachine } from "@xstate/react";
import { Container, CssBaseline } from "@mui/material";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import PrivateRoutesContainer from "./PrivateRoutesContainer";
import { GoogleLogin, useGoogleLogin } from "@matheusluizn/react-google-login";

// @ts-ignore
if (window.Cypress) {
  // Expose authService on window for Cypress
  // @ts-ignore
  window.authService = authService;
}

const PREFIX = "AppGoogle";

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
  },

  [`& .${classes.paper}`]: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

/* istanbul ignore next */
const AppGoogle: React.FC = () => {
  const [authState] = useActor(authService);
  const [, , notificationsService] = useMachine(notificationsMachine);

  const [, , snackbarService] = useMachine(snackbarMachine);

  const [, , bankAccountsService] = useMachine(bankAccountsMachine);

  // @ts-ignore
  if (window.Cypress) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const { user, token } = JSON.parse(localStorage.getItem("googleCypress")!);
      authService.send("GOOGLE", {
        user,
        token,
      });
    }, []);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGoogleLogin({
      clientId: process.env.VITE_GOOGLE_CLIENTID!,
      onSuccess: (res) => {
        console.log("onSuccess", res);
        // @ts-ignore
        authService.send("GOOGLE", { user: res.profileObj, token: res.tokenId });
      },
      cookiePolicy: "single_host_origin",
      isSignedIn: true,
    });
  }

  const isLoggedIn = authState.matches("authorized");

  return (
    <Root className={classes.root}>
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
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <GoogleLogin
              clientId={process.env.VITE_GOOGLE_CLIENTID!}
              buttonText="Login"
              cookiePolicy={"single_host_origin"}
            />
          </div>
        </Container>
      )}

      <AlertBar snackbarService={snackbarService} />
    </Root>
  );
};

export default AppGoogle;
