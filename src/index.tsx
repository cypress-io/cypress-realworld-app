import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import { createTheme, StyledEngineProvider, adaptV4Theme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import App from "./containers/App";
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

root.render(
  <Router history={history}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </Router>
);
