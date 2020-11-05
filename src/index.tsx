import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { history } from "./utils/historyUtils";

import App from "./containers/App";
import AppGoogle from "./containers/AppGoogle";
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
      {process.env.REACT_APP_GOOGLE ? <AppGoogle /> : <App />}
    </ThemeProvider>
  </Router>,
  document.getElementById("root")
);
