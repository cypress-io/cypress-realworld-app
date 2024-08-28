import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import {
  createTheme,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  adaptV4Theme,
} from "@mui/material";

import AppCognito from "./containers/AppCognito";
import { history } from "./utils/historyUtils";

const theme = createTheme(
  adaptV4Theme({
    palette: {
      secondary: {
        main: "#fff",
      },
    },
  })
);

const root = createRoot(document.getElementById("root")!);

if (process.env.VITE_AWS_COGNITO) {
  /* istanbul ignore next */
  root.render(
    <Router history={history}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AppCognito />
        </ThemeProvider>
      </StyledEngineProvider>
    </Router>
  );
} else {
  console.error("Cognito is not configured.");
}
