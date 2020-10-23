import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { history } from "./utils/historyUtils";
/* istanbul ignore next */
// @ts-ignore
import { Security } from "@okta/okta-react";

import App from "./containers/App";
import AppOkta from "./containers/AppOkta";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#fff",
    },
  },
});

ReactDOM.render(
  <Router history={history}>
    <ThemeProvider theme={theme}>
      {process.env.REACT_APP_OKTA ? (
        /* istanbul ignore next */
        <Security
          issuer={`https://${process.env.REACT_APP_OKTA_DOMAIN}/oauth2/default`}
          clientId={process.env.REACT_APP_OKTA_CLIENTID}
          redirectUri={window.location.origin + "/implicit/callback"}
        >
          <AppOkta />
        </Security>
      ) : (
        <App />
      )}
    </ThemeProvider>
  </Router>,
  document.getElementById("root")
);
