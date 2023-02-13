import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import { createTheme, ThemeProvider } from "@material-ui/core";
import { Auth0Provider } from "@auth0/auth0-react";
/* istanbul ignore next */
// @ts-ignore
import { OktaAuth } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";

import App from "./containers/App";
import AppGoogle from "./containers/AppGoogle";
import AppAuth0 from "./containers/AppAuth0";
import AppOkta from "./containers/AppOkta";
import AppCognito from "./containers/AppCognito";
import { history } from "./utils/historyUtils";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#fff",
    },
  },
});

/* istanbul ignore next */
const onRedirectCallback = (appState: any) => {
  history.replace((appState && appState.returnTo) || window.location.pathname);
};

const root = createRoot(document.getElementById("root"));

/* istanbul ignore if */
if (process.env.REACT_APP_AUTH0) {
  root.render(
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN!}
      clientId={process.env.REACT_APP_AUTH0_CLIENTID!}
      redirectUri={window.location.origin}
      audience={process.env.REACT_APP_AUTH0_AUDIENCE}
      scope={process.env.REACT_APP_AUTH0_SCOPE}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
    >
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <AppAuth0 />
        </ThemeProvider>
      </Router>
    </Auth0Provider>
  );
} else if (process.env.REACT_APP_OKTA) {
  const oktaAuth = new OktaAuth({
    issuer: `https://${process.env.REACT_APP_OKTA_DOMAIN}/oauth2/default`,
    clientId: process.env.REACT_APP_OKTA_CLIENTID,
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
} else if (process.env.REACT_APP_AWS_COGNITO) {
  /* istanbul ignore next */
  root.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <AppCognito />
      </ThemeProvider>
    </Router>
  );
} else if (process.env.REACT_APP_GOOGLE) {
  /* istanbul ignore next */
  root.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <AppGoogle />
      </ThemeProvider>
    </Router>
  );
} else {
  root.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Router>
  );
}
