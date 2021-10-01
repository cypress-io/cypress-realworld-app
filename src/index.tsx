import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { Auth0Provider } from "@auth0/auth0-react";
/* istanbul ignore next */
// @ts-ignore
//import { OktaAuth } from "@okta/okta-auth-js";
//import { Security } from "@okta/okta-react";

import App from "./containers/App";
import AppGoogle from "./containers/AppGoogle";
import AppAuth0 from "./containers/AppAuth0";
import AppOkta from "./containers/AppOkta";
import AppCognito from "./containers/AppCognito";
import { history } from "./utils/historyUtils";

const theme = createMuiTheme({
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

/* istanbul ignore if */
if (import.meta.env.VITE_AUTH0) {
  ReactDOM.render(
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN!}
      clientId={import.meta.env.VITE_AUTH0_CLIENTID!}
      redirectUri={window.location.origin}
      audience={import.meta.env.VITE_AUTH0_AUDIENCE}
      scope={import.meta.env.VITE_AUTH0_SCOPE}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
    >
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <AppAuth0 />
        </ThemeProvider>
      </Router>
    </Auth0Provider>,
    document.getElementById("root")
  );
  /*} else if (import.meta.env.VITE_OKTA) {
  const oktaAuth = new OktaAuth({
    issuer: `https://${import.meta.env.VITE_OKTA_DOMAIN}/oauth2/default`,
    clientId: import.meta.env.VITE_OKTA_CLIENTID,
    redirectUri: window.location.origin + "/implicit/callback",
  });

  ReactDOM.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        {import.meta.env.VITE_OKTA ? (
          <Security oktaAuth={oktaAuth}>
            <AppOkta />
          </Security>
        ) : (
          <App />
        )}
      </ThemeProvider>
    </Router>,
    document.getElementById("root")
  );
} else if (import.meta.env.VITE_AWS_COGNITO) {
  ReactDOM.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <AppCognito />
      </ThemeProvider>
    </Router>,
    document.getElementById("root")
  );
  */
} else if (import.meta.env.VITE_GOOGLE) {
  /* istanbul ignore next */
  ReactDOM.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <AppGoogle />
      </ThemeProvider>
    </Router>,
    document.getElementById("root")
  );
} else {
  ReactDOM.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Router>,
    document.getElementById("root")
  );
}
