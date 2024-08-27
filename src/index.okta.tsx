import React from "react";
import { createRoot } from "react-dom/client";
import { Router, withRouter } from "react-router-dom";
import {
  createTheme,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  adaptV4Theme,
} from "@mui/material";

// @ts-ignore
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";
import { history } from "./utils/historyUtils";
import AppOkta from "./containers/AppOkta";

const theme = createTheme(
  adaptV4Theme({
    palette: {
      secondary: {
        main: "#fff",
      },
    },
  })
);

const root = createRoot(document.getElementById("root")!);

if (process.env.VITE_OKTA) {
  const oktaAuth = new OktaAuth({
    issuer: `https://${process.env.VITE_OKTA_DOMAIN}/oauth2/default`,
    clientId: process.env.VITE_OKTA_CLIENTID,
    redirectUri: window.location.origin + "/implicit/callback",
  });

  const AppWithRouter = withRouter(({ history }) => {
    const restoreOriginalUri = (_oktaAuth, originalUri) =>
      history.replace(toRelativeUrl(originalUri || "/", window.location.origin));

    return (
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <AppOkta />
      </Security>
    );
  });

  /* istanbul ignore next */
  root.render(
    <Router history={history}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AppWithRouter />
        </ThemeProvider>
      </StyledEngineProvider>
    </Router>
  );
} else {
  console.error("Okta is not configured.");
}
