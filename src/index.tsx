import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { Auth0Provider } from "@auth0/auth0-react";
import { history } from "./utils/historyUtils";

import App from "./containers/App";
import AppAuth0 from "./containers/AppAuth0";

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#fff",
    },
  },
});

const onRedirectCallback = (appState: any) => {
  history.replace((appState && appState.returnTo) || window.location.pathname);
};
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
