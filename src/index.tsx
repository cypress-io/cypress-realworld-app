import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
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
if (process.env.REACT_APP_AUTH0) {
  ReactDOM.render(
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
    </Auth0Provider>,
    document.getElementById("root")
  );
} else if (process.env.REACT_APP_OKTA) {
  const oktaAuth = new OktaAuth({
    issuer: `https://${process.env.REACT_APP_OKTA_DOMAIN}/oauth2/default`,
    clientId: process.env.REACT_APP_OKTA_CLIENTID,
    redirectUri: window.location.origin + "/implicit/callback",
  });

  /* istanbul ignore next */
  ReactDOM.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        {process.env.REACT_APP_OKTA ? (
          /* istanbul ignore next */
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
} else if (process.env.REACT_APP_AWS_COGNITO) {
  /* istanbul ignore next */
  ReactDOM.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <AppCognito />
      </ThemeProvider>
    </Router>,
    document.getElementById("root")
  );
} else if (process.env.REACT_APP_GOOGLE) {
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
