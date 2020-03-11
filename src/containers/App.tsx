import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { connect } from "react-redux";
import { useMachine } from "@xstate/react";

import { bootstrap } from "../actions/app";
import { IRootReducerState } from "../reducers";
import PrivateRoute from "./PrivateRoute";
import TransactionsContainer from "../containers/TransactionsContainer";
import TransactionDetailContainer from "./TransactionDetailContainer";
import SignIn from "../containers/SignIn";
import SignUp from "../containers/SignUp";
import TransactionCreateContainer from "./TransactionCreateContainer";
import NotificationsContainer from "./NotificationsContainer";
import UserSettingsContainer from "./UserSettingsContainer";
import BankAccountsContainer from "./BankAccountsContainer";
import BankAccountCreateContainer from "./BankAccountCreateContainer";

import { notificationsMachine } from "../machines/notificationsMachine";
import { NotificationUpdatePayload } from "../models";
//import MainLayout from "../components/MainLayout";

interface StateProps {
  isBootstrapped: boolean;
  isLoggedIn: boolean;
}

interface DispatchProps {
  bootstrapApp: () => void;
}

type Props = StateProps & DispatchProps;

const App: React.FC<Props> = ({ isBootstrapped, bootstrapApp }) => {
  const [notificationsState, sendNotifications] = useMachine(
    notificationsMachine,
    {
      devTools: true
    }
  );
  const updateNotification = (payload: NotificationUpdatePayload) =>
    sendNotifications("UPDATE", payload);

  useEffect(() => {
    sendNotifications({ type: "FETCH" });

    if (!isBootstrapped) {
      bootstrapApp();
    }
  }, [sendNotifications]);

  /*
  const MainContainer: React.FC<{ children: React.ReactNode }> = ({
    children
  }) => (
    <MainLayout
      signOutPending={() => {}}
      allNotifications={notificationsState.context.results!}
      currentUser={{
        id: "9IUK0xpw",
        uuid: "a6218702-3254-4d3e-af48-9ebb7ee73e76",
        firstName: "Lizzie",
        lastName: "Heathcote",
        username: "Teresa34",
        password:
          "$2b$10$D12H6XSK7XF61yjhZgNn3urSCGQEGzbY6agMXZihTtyk1TIKXil0C",
        email: "Zakary.Bashirian@yahoo.com",
        phoneNumber: "+12133734253",
        avatar: "https://i.pravatar.cc/150?img=32",
        defaultPrivacyLevel: DefaultPrivacyLevel.private,
        balance: 55000,
        createdAt: new Date(),
        modifiedAt: new Date()
      }}
      snackbar={{}}
    >
      {children}
    </MainLayout>
  );
  */

  return (
    <Switch>
      <PrivateRoute exact path={"/(public|contacts|personal)?"}>
        <TransactionsContainer />
      </PrivateRoute>
      <PrivateRoute exact path="/user/settings">
        <UserSettingsContainer />
      </PrivateRoute>
      <PrivateRoute exact path="/notifications">
        <NotificationsContainer
          notifications={notificationsState.context.results!}
          updateNotification={updateNotification}
        />
        {/*<MainContainer>
          <NotificationsContainer
            notifications={notificationsState.context.results!}
            updateNotification={updateNotification}
          />
        </MainContainer>*/}
      </PrivateRoute>
      <PrivateRoute exact path="/bankaccount/new">
        <BankAccountCreateContainer />
      </PrivateRoute>
      <PrivateRoute exact path="/bankaccounts">
        <BankAccountsContainer />
      </PrivateRoute>
      <PrivateRoute exact path="/transaction/new">
        <TransactionCreateContainer />
      </PrivateRoute>
      <PrivateRoute exact path="/transaction/:transactionId">
        <TransactionDetailContainer />
      </PrivateRoute>
      <Route path="/signin">
        <SignIn />
      </Route>
      <Route path="/signup">
        <SignUp />
      </Route>
    </Switch>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  isBootstrapped: state.app.isBootstrapped,
  isLoggedIn: state.user.isLoggedIn
});

const dispatchProps = {
  bootstrapApp: bootstrap
};

export default connect(mapStateToProps, dispatchProps)(App);
