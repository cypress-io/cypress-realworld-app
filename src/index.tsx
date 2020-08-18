import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { history } from "./utils/historyUtils";

import App from "./containers/App";
import AppCognito from "./containers/AppCognito";

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
      {process.env.REACT_APP_AWS_COGNITO ? <AppCognito /> : <App />}
    </ThemeProvider>
  </Router>,
  document.getElementById("root")
);
