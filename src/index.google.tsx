import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import { createTheme, ThemeProvider } from "@material-ui/core";

import AppGoogle from "./containers/AppGoogle";
import { history } from "./utils/historyUtils";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#fff",
    },
  },
});

const root = createRoot(document.getElementById("root")!);

if (process.env.VITE_APP_GOOGLE) {
  /* istanbul ignore next */
  root.render(
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <AppGoogle />
      </ThemeProvider>
    </Router>
  );
} else {
  console.error("Google is not configured.");
}
