import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import { createTheme, StyledEngineProvider } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import App from "./containers/App";
import { history } from "./utils/historyUtils";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#fff",
    },
  },
  typography: {
    // htmlFontSize: 18.285714285714286,
    fontSize: 14 * 0.875,
    body1: {
      lineHeight: 1.43,
      letterSpacing: "0.01071em",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "6px 0 7px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          padding: "6px 0 7px",
        },
      },
    },
    // MuiInput: {
    //   defaultProps: {
    //     inputProps: {
    //       backgroundColor: "green",
    //       height: "300px",
    //     },
    //   },
    // },
  },
});

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
