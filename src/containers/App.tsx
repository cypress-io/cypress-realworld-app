import React from "react";
import { Switch, Route } from "react-router-dom";
import { useService } from "@xstate/react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

import { snackbarService } from "../machines/snackbarMachine";
import { notificationsService } from "../machines/notificationsMachine";
import { authService } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";
import { bankAccountsService } from "../machines/bankAccountsMachine";
import MainLayout from "../components/MainLayout";
import UserOnboardingContainer from "./UserOnboardingContainer";
import PrivateRoute from "../components/PrivateRoute";
import TransactionsContainer from "./TransactionsContainer";
import UserSettingsContainer from "./UserSettingsContainer";
import NotificationsContainer from "./NotificationsContainer";
import BankAccountsContainer from "./BankAccountsContainer";
import TransactionCreateContainer from "./TransactionCreateContainer";
import TransactionDetailContainer from "./TransactionDetailContainer";

// @ts-ignore
if (window.Cypress) {
  // Expose authService on window for Cypress
  // @ts-ignore
  window.authService = authService;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [authState] = useService(authService);

  const isLoggedIn =
    authState.matches("authorized") ||
    authState.matches("refreshing") ||
    authState.matches("updating");

  console.log({ isLoggedIn });
  // @ts-ignore
  if (window.Cypress) {
    // @ts-ignore
    window.Cypress.log({ message: `App ${isLoggedIn}` });
  }

  return (
    <div className={classes.root}>
      <CssBaseline />

      <Switch>
        <PrivateRoute isLoggedIn={isLoggedIn} exact path="/user/settings">
          <MainLayout notificationsService={notificationsService} authService={authService}>
            <UserSettingsContainer authService={authService} />
          </MainLayout>
        </PrivateRoute>
        <PrivateRoute isLoggedIn={isLoggedIn} exact path="/notifications">
          <MainLayout notificationsService={notificationsService} authService={authService}>
            <NotificationsContainer
              authService={authService}
              notificationsService={notificationsService}
            />
          </MainLayout>
        </PrivateRoute>
        <PrivateRoute isLoggedIn={isLoggedIn} path="/bankaccounts*">
          <MainLayout notificationsService={notificationsService} authService={authService}>
            <BankAccountsContainer
              authService={authService}
              bankAccountsService={bankAccountsService}
            />
          </MainLayout>
        </PrivateRoute>
        <PrivateRoute isLoggedIn={isLoggedIn} exact path="/transaction/new">
          <MainLayout notificationsService={notificationsService} authService={authService}>
            <TransactionCreateContainer
              authService={authService}
              snackbarService={snackbarService}
            />
          </MainLayout>
        </PrivateRoute>
        <PrivateRoute isLoggedIn={isLoggedIn} exact path="/transaction/:transactionId">
          <MainLayout notificationsService={notificationsService} authService={authService}>
            <TransactionDetailContainer authService={authService} />
          </MainLayout>
        </PrivateRoute>
        <Route exact path="/signup">
          <SignUpForm authService={authService} />
        </Route>
        <Route exact path="/signin">
          <SignInForm authService={authService} />
        </Route>
        <PrivateRoute isLoggedIn={isLoggedIn} exact path="/(public|contacts|personal)?">
          <MainLayout notificationsService={notificationsService} authService={authService}>
            <UserOnboardingContainer
              authService={authService}
              bankAccountsService={bankAccountsService}
            />
            <TransactionsContainer />
          </MainLayout>
        </PrivateRoute>
      </Switch>
      <AlertBar snackbarService={snackbarService} />
    </div>
  );
};

export default React.memo(App);
