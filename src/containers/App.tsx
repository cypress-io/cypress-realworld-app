import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { RouteProps } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import PrivateRoute from "../components/PrivateRoute";
import TransactionsContainer from "../containers/TransactionsContainer";
import TransactionDetailContainer from "./TransactionDetailContainer";
import TransactionCreateContainer from "./TransactionCreateContainer";
import NotificationsContainer from "./NotificationsContainer";
import UserSettingsContainer from "./UserSettingsContainer";
import BankAccountsContainer from "./BankAccountsContainer";

import { snackbarMachine, SnackbarContext } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authMachine } from "../machines/authMachine";
import {
  NotificationUpdatePayload,
  SignInPayload,
  SignUpPayload
} from "../models";
import SignInForm from "../components/SignInForm";
import MainLayout from "../components/MainLayout";
import SignUpForm from "../components/SignUpForm";

interface PrivateRouteWithStateProps extends RouteProps {
  children: React.ReactNode;
}

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  }
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [authState, sendAuth] = useMachine(authMachine, {
    devTools: true
  });
  const [notificationsState, sendNotifications] = useMachine(
    notificationsMachine,
    {
      devTools: true
    }
  );
  const [snackbarState, sendSnackbar] = useMachine(snackbarMachine, {
    devTools: true
  });

  const updateNotification = (payload: NotificationUpdatePayload) =>
    sendNotifications("UPDATE", payload);
  const signInPending = (payload: SignInPayload) => sendAuth("LOGIN", payload);
  const signUpPending = (payload: SignUpPayload) => sendAuth("SIGNUP", payload);
  const updateUser = (payload: any) => sendAuth("UPDATE", payload);
  const signOutPending = () => sendAuth("LOGOUT");
  const showSnackbar = (payload: SnackbarContext) =>
    sendSnackbar("SHOW", payload);

  const isLoggedIn = authState.matches("authorized");
  const currentUser = authState.context.user;

  useEffect(() => {
    if (authState.matches("authorized")) {
      sendNotifications({ type: "FETCH" });
    }

    /*
    const subscription = service.subscribe((state: any) => {
      // simple state logging
      console.log(state);
    });

    return subscription.unsubscribe;*/
  }, [authState, sendNotifications]);

  const PrivateRouteWithState: React.FC<PrivateRouteWithStateProps> = ({
    children,
    ...rest
  }) => (
    <PrivateRoute isLoggedIn={isLoggedIn} {...rest}>
      <MainLayout
        signOutPending={signOutPending}
        allNotifications={notificationsState.context.results!}
        currentUser={currentUser}
      >
        {children}
      </MainLayout>
    </PrivateRoute>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Switch>
        <PrivateRouteWithState exact path={"/(public|contacts|personal)?"}>
          <TransactionsContainer />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/user/settings">
          <UserSettingsContainer
            currentUser={currentUser}
            updateUser={updateUser}
          />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/notifications">
          <NotificationsContainer
            notifications={notificationsState.context.results!}
            updateNotification={updateNotification}
          />
        </PrivateRouteWithState>
        <PrivateRouteWithState path="/bankaccounts*">
          <BankAccountsContainer currentUserId={currentUser?.id} />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/transaction/new">
          <TransactionCreateContainer
            sender={currentUser}
            showSnackbar={showSnackbar}
          />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/transaction/:transactionId">
          <TransactionDetailContainer currentUser={currentUser} />
        </PrivateRouteWithState>
        <Route path="/signin">
          <SignInForm signInPending={signInPending} />
        </Route>
        <Route path="/signup">
          <SignUpForm signUpPending={signUpPending} />
        </Route>
      </Switch>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={snackbarState.matches("visible")}
        autoHideDuration={3000}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity={snackbarState.context.severity}
        >
          {snackbarState.context.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
