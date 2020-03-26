import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { Interpreter } from "xstate";
import MainLayout from "../components/MainLayout";
import TransactionsContainer from "./TransactionsContainer";
import UserSettingsContainer from "./UserSettingsContainer";
import NotificationsContainer from "./NotificationsContainer";
import BankAccountsContainer from "./BankAccountsContainer";
import TransactionCreateContainer from "./TransactionCreateContainer";
import TransactionDetailContainer from "./TransactionDetailContainer";
import { DataContext, DataSchema, DataEvents } from "../machines/dataMachine";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import {
  SnackbarContext,
  SnackbarSchema,
  SnackbarEvents
} from "../machines/snackbarMachine";
import { useService } from "@xstate/react";
import UserOnboardingContainer from "./UserOnboardingContainer";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
  notificationsService: Interpreter<DataContext, DataSchema, DataEvents, any>;
  snackbarService: Interpreter<
    SnackbarContext,
    SnackbarSchema,
    SnackbarEvents,
    any
  >;
  bankAccountsService: Interpreter<DataContext, any, DataEvents, any>;
}

const PrivateRoutesContainer: React.FC<Props> = ({
  authService,
  notificationsService,
  snackbarService,
  bankAccountsService
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notificationsState, sendNotifications] = useService(
    notificationsService
  );

  useEffect(() => {
    sendNotifications({ type: "FETCH" });
    const authSubscription = authService.subscribe(state => {
      console.log(state);

      localStorage.setItem("authState", JSON.stringify(state));
    });

    return authSubscription.unsubscribe;
  }, [sendNotifications, authService]);

  return (
    <MainLayout
      notificationsService={notificationsService}
      authService={authService}
    >
      <UserOnboardingContainer
        authService={authService}
        bankAccountsService={bankAccountsService}
      />
      <Switch>
        <Route exact path={"/(public|contacts|personal)?"}>
          <TransactionsContainer />
        </Route>
        <Route exact path="/user/settings">
          <UserSettingsContainer authService={authService} />
        </Route>
        <Route exact path="/notifications">
          <NotificationsContainer
            authService={authService}
            notificationsService={notificationsService}
          />
        </Route>
        <Route path="/bankaccounts*">
          <BankAccountsContainer
            authService={authService}
            bankAccountsService={bankAccountsService}
          />
        </Route>
        <Route exact path="/transaction/new">
          <TransactionCreateContainer
            authService={authService}
            snackbarService={snackbarService}
          />
        </Route>
        <Route exact path="/transaction/:transactionId">
          <TransactionDetailContainer authService={authService} />
        </Route>
      </Switch>
    </MainLayout>
  );
};

export default PrivateRoutesContainer;
