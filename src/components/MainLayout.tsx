import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import { Interpreter } from "xstate";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { useMediaQuery, useTheme } from "@material-ui/core";

import Footer from "./Footer";
import NavBar from "./NavBar";
import NavDrawer from "./NavDrawer";
import { DataContext, DataEvents } from "../machines/dataMachine";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import { drawerMachine } from "../machines/drawerMachine";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(4),
  },
}));

interface Props {
  children: React.ReactNode;
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
  notificationsService: Interpreter<DataContext, any, DataEvents, any>;
}

const MainLayout: React.FC<Props> = ({
  children,
  notificationsService,
  authService,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [drawerState, sendDrawer] = useMachine(drawerMachine, {
    devTools: true,
  });

  const aboveSmallBreakpoint = useMediaQuery(theme.breakpoints.up("sm"));
  const xsBreakpoint = useMediaQuery(theme.breakpoints.only("xs"));

  const desktopDrawerOpen = drawerState?.matches({ desktop: "open" });
  const mobileDrawerOpen = drawerState?.matches({ mobile: "open" });
  const toggleDesktopDrawer = () => {
    sendDrawer("TOGGLE_DESKTOP");
  };
  const toggleMobileDrawer = () => {
    sendDrawer("TOGGLE_MOBILE");
  };

  const openDesktopDrawer = (payload: any) =>
    sendDrawer("OPEN_DESKTOP", payload);
  const closeMobileDrawer = () => sendDrawer("CLOSE_MOBILE");

  useEffect(() => {
    if (!desktopDrawerOpen && aboveSmallBreakpoint) {
      openDesktopDrawer({ aboveSmallBreakpoint });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aboveSmallBreakpoint, desktopDrawerOpen]);

  return (
    <>
      <NavBar
        toggleDrawer={xsBreakpoint ? toggleMobileDrawer : toggleDesktopDrawer}
        drawerOpen={xsBreakpoint ? mobileDrawerOpen : desktopDrawerOpen}
        notificationsService={notificationsService}
      />
      <NavDrawer
        toggleDrawer={xsBreakpoint ? toggleMobileDrawer : toggleDesktopDrawer}
        drawerOpen={xsBreakpoint ? mobileDrawerOpen : desktopDrawerOpen}
        closeMobileDrawer={closeMobileDrawer}
        authService={authService}
      />
      <main className={classes.content} data-test="main">
        <div className={classes.appBarSpacer} />
        <Container maxWidth="md" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {children}
            </Grid>
          </Grid>
          <Box pt={4}>
            <Footer />
          </Box>
        </Container>
      </main>
    </>
  );
};

export default MainLayout;
