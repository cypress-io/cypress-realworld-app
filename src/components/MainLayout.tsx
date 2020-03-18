import React, { useEffect } from "react";
import { useService } from "@xstate/react";
import { Interpreter, AnyEventObject } from "xstate";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Copyright from "../components/Copyright";
import NavBar from "./NavBar";
import NavDrawer from "./NavDrawer";
import { User } from "../models";
import { DataContext, DataEvents } from "../machines/dataMachine";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto"
  },
  container: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(4)
  }
}));

interface Props {
  signOutPending: () => void;
  children: React.ReactNode;
  currentUser?: User;
  notificationsService: Interpreter<DataContext, any, DataEvents, any>;
  drawerService: Interpreter<any, any, AnyEventObject, any>;
}

const MainLayout: React.FC<Props> = ({
  signOutPending,
  children,
  currentUser,
  notificationsService,
  drawerService
}) => {
  const classes = useStyles();
  const [drawerState, sendDrawer] = useService(drawerService);

  useEffect(() => {
    drawerService.subscribe((state: any) => {
      console.log("NOTIFICATIONS STATE: ", state);
    });

    // @ts-ignore
    return drawerService.unsubscribe!;
  }, [drawerService]);

  const drawerOpen = drawerState.matches("open");
  const toggleDrawer = () => {
    sendDrawer("TOGGLE");
  };

  return (
    <>
      <NavBar
        handleDrawerOpen={toggleDrawer}
        drawerOpen={drawerOpen}
        notificationsService={notificationsService}
      />
      <NavDrawer
        currentUser={currentUser}
        handleDrawerClose={toggleDrawer}
        drawerOpen={drawerOpen}
        signOutPending={signOutPending}
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
            <Copyright />
          </Box>
        </Container>
      </main>
    </>
  );
};

export default MainLayout;
