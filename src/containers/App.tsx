import React from "react";
import { Switch, Route } from "react-router";
import { RouteProps } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

import PrivateRoute from "../components/PrivateRoute";
import TransactionsContainer from "../containers/TransactionsContainer";
import TransactionDetailContainer from "./TransactionDetailContainer";
import TransactionCreateContainer from "./TransactionCreateContainer";
import NotificationsContainer from "./NotificationsContainer";
import UserSettingsContainer from "./UserSettingsContainer";
import BankAccountsContainer from "./BankAccountsContainer";

import { snackbarMachine } from "../machines/snackbarMachine";
import { notificationsMachine } from "../machines/notificationsMachine";
import { authMachine } from "../machines/authMachine";
import { SignInPayload, SignUpPayload } from "../models";
import SignInForm from "../components/SignInForm";
import MainLayout from "../components/MainLayout";
import SignUpForm from "../components/SignUpForm";
import AlertBar from "../components/AlertBar";

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
  const [authState, sendAuth, authService] = useMachine(authMachine, {
    devTools: true
  });
  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    notificationsState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendNotifications,
    notificationsService
  ] = useMachine(notificationsMachine, {
    devTools: true
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [snackbarState, sendSnackbar, snackbarService] = useMachine(
    snackbarMachine,
    {
      devTools: true
    }
  );

  const signInPending = (payload: SignInPayload) => sendAuth("LOGIN", payload);
  const signUpPending = (payload: SignUpPayload) => sendAuth("SIGNUP", payload);

  const isLoggedIn =
    authState.matches("authorized") || authState.matches("refreshing");

  const PrivateRouteWithState: React.FC<PrivateRouteWithStateProps> = ({
    children,
    ...rest
  }) => (
    <PrivateRoute isLoggedIn={isLoggedIn} {...rest}>
      <MainLayout
        notificationsService={notificationsService}
        authService={authService}
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
          <UserSettingsContainer authService={authService} />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/notifications">
          <NotificationsContainer
            authService={authService}
            notificationsService={notificationsService}
          />
        </PrivateRouteWithState>
        <PrivateRouteWithState path="/bankaccounts*">
          <BankAccountsContainer authService={authService} />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/transaction/new">
          <TransactionCreateContainer
            authService={authService}
            snackbarService={snackbarService}
          />
        </PrivateRouteWithState>
        <PrivateRouteWithState exact path="/transaction/:transactionId">
          <TransactionDetailContainer authService={authService} />
        </PrivateRouteWithState>
        <Route path="/signin">
          <SignInForm signInPending={signInPending} />
        </Route>
        <Route path="/signup">
          <SignUpForm signUpPending={signUpPending} />
        </Route>
      </Switch>
      <AlertBar snackbarService={snackbarService} />
    </div>
  );
};

export default App;
