import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Copyright from "../components/Copyright";
import NavBar from "./NavBar";
import NavDrawer from "./NavDrawer";
import { NotificationType, User } from "../models";

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
  allNotifications: NotificationType[];
  currentUser?: User;
  toggleDrawer: () => void;
  drawerOpen: boolean;
}

const MainLayout: React.FC<Props> = ({
  signOutPending,
  children,
  allNotifications,
  currentUser,
  toggleDrawer,
  drawerOpen
}) => {
  const classes = useStyles();

  return (
    <>
      <NavBar
        handleDrawerOpen={toggleDrawer}
        drawerOpen={drawerOpen}
        allNotifications={allNotifications}
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
