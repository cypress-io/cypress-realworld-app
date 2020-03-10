import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { useMachine } from "@xstate/react";

import Copyright from "../components/Copyright";
import NavBar from "./NavBar";
import NavDrawer from "./NavDrawer";
import { NotificationType, User } from "../models";
import { drawerMachine } from "../machines/drawerMachine";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
  currentUser: User;
  snackbar: object;
}

const MainLayout: React.FC<Props> = ({
  signOutPending,
  children,
  allNotifications,
  currentUser,
  snackbar
}) => {
  const [drawerState, sendDrawer] = useMachine(drawerMachine);

  const classes = useStyles();
  // @ts-ignore
  const { severity, message } = snackbar;

  const toggleDrawer = () => {
    sendDrawer("TOGGLE");
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      {message && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={true}
          autoHideDuration={6000}
        >
          <Alert severity={severity}>{message}</Alert>
        </Snackbar>
      )}
      <NavBar
        handleDrawerOpen={toggleDrawer}
        drawerOpen={drawerState.matches("open")}
        allNotifications={allNotifications}
      />
      <NavDrawer
        currentUser={currentUser}
        handleDrawerClose={toggleDrawer}
        drawerOpen={drawerState.matches("open")}
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
    </div>
  );
};

export default MainLayout;
