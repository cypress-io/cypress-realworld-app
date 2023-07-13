import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import { createTheme, ThemeProvider } from "@material-ui/core";

// @ts-ignore
import { OktaAuth } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";
import { history } from "./utils/historyUtils";
import AppOkta from "./containers/AppOkta";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#fff",
    },
  },
});

const root = createRoot(document.getElementById("root")!);

if (process.env.VITE_APP_OKTA) {
  const oktaAuth = new OktaAuth({
    issuer: `https://${process.env.VITE_APP_OKTA_DOMAIN}/oauth2/default`,
    clientId: process.env.VITE_APP_OKTA_CLIENTID,
    redirectUri: window.location.origin + "/implicit/callback",
  });
  /* istanbul ignore next */
  root.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <Security oktaAuth={oktaAuth}>
          <AppOkta />
        </Security>
      </ThemeProvider>
    </Router>
  );
} else {
  console.error("Okta is not configured.");
}
