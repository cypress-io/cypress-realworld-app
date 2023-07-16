import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import { createTheme, ThemeProvider } from "@material-ui/core";
import { Auth0Provider } from "@auth0/auth0-react";
import AppAuth0 from "./containers/AppAuth0";
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

const root = createRoot(document.getElementById("root")!);

/* istanbul ignore if */
if (process.env.VITE_APP_AUTH0) {
  root.render(
    <Auth0Provider
      domain={process.env.VITE_APP_AUTH0_DOMAIN!}
      clientId={process.env.VITE_APP_AUTH0_CLIENTID!}
      redirectUri={window.location.origin}
      audience={process.env.VITE_APP_AUTH0_AUDIENCE}
      scope={process.env.VITE_APP_AUTH0_SCOPE}
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
} else {
  console.error("Auth0 is not configured.");
}
