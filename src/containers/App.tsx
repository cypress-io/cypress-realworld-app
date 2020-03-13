import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { RouteProps } from "react-router-dom";
import { connect } from "react-redux";
import { useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import { bootstrap } from "../actions/app";
import { IRootReducerState } from "../reducers";
import PrivateRoute from "../components/PrivateRoute";
import TransactionsContainer from "../containers/TransactionsContainer";
import TransactionDetailContainer from "./TransactionDetailContainer";
import SignUp from "../containers/SignUp";
import TransactionCreateContainer from "./TransactionCreateContainer";
import NotificationsContainer from "./NotificationsContainer";
import UserSettingsContainer from "./UserSettingsContainer";
import BankAccountsContainer from "./BankAccountsContainer";
import BankAccountCreateContainer from "./BankAccountCreateContainer";

import { snackbarMachine, SnackbarContext } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authMachine } from "../machines/authMachine";
import { NotificationUpdatePayload, SignInPayload } from "../models";
import SignInForm from "../components/SignInForm";
import MainLayout from "../components/MainLayout";

interface StateProps {
  isBootstrapped: boolean;
}

interface DispatchProps {
  bootstrapApp: () => void;
}

interface PrivateRouteWithStateProps extends RouteProps {
  children: React.ReactNode;
}

type Props = StateProps & DispatchProps;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  }
}));

const App: React.FC<Props> = ({ isBootstrapped, bootstrapApp }) => {
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
  const signOutPending = () => sendAuth("LOGOUT");
  const showSnackbar = (payload: SnackbarContext) =>
    sendSnackbar("SHOW", payload);

  const isLoggedIn = authState.matches("authorized");
  const currentUser = authState.context.user;

  useEffect(() => {
    sendNotifications({ type: "FETCH" });

    if (!isBootstrapped) {
      bootstrapApp();
    }
  }, [sendNotifications]);

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
          <UserSettingsContainer />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/notifications">
          <NotificationsContainer
            notifications={notificationsState.context.results!}
            updateNotification={updateNotification}
          />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/bankaccount/new">
          <BankAccountCreateContainer />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/bankaccounts">
          <BankAccountsContainer />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/transaction/new">
          <TransactionCreateContainer
            sender={currentUser}
            showSnackbar={showSnackbar}
          />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/transaction/:transactionId">
          <TransactionDetailContainer />
        </PrivateRouteWithState>
        <Route path="/signin">
          <SignInForm signInPending={signInPending} />
        </Route>
        <Route path="/signup">
          <SignUp />
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

const mapStateToProps = (state: IRootReducerState) => ({
  isBootstrapped: state.app.isBootstrapped
});

const dispatchProps = {
  bootstrapApp: bootstrap
};

export default connect(mapStateToProps, dispatchProps)(App);
