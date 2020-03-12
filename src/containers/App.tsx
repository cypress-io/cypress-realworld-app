import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { RouteProps } from "react-router-dom";
import { connect } from "react-redux";
import { useMachine } from "@xstate/react";

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

const App: React.FC<Props> = ({ isBootstrapped, bootstrapApp }) => {
  const [authState, sendAuth] = useMachine(authMachine, {
    devTools: true
  });
  const [notificationsState, sendNotifications] = useMachine(
    notificationsMachine,
    {
      devTools: true
    }
  );
  const updateNotification = (payload: NotificationUpdatePayload) =>
    sendNotifications("UPDATE", payload);
  const signInPending = (payload: SignInPayload) => sendAuth("LOGIN", payload);
  const signOutPending = () => sendAuth("LOGOUT");

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
        snackbar={{}}
      >
        {children}
      </MainLayout>
    </PrivateRoute>
  );

  return (
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
        <TransactionCreateContainer />
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
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  isBootstrapped: state.app.isBootstrapped
});

const dispatchProps = {
  bootstrapApp: bootstrap
};

export default connect(mapStateToProps, dispatchProps)(App);
