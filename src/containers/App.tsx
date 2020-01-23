import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { connect } from "react-redux";

import { bootstrap } from "../actions/app";
import { signInPending, signOutPending } from "../actions/auth";
import { IRootReducerState } from "../reducers";
import TransactionList from "../components/TransactionList";
import PrivateRoute from "../components/PrivateRoute";
import MainLayout from "../components/MainLayout";
import SignIn from "../components/SignIn";
import { User } from "../models";
import SignUp from "../containers/SignUp";

interface StateProps {
  isBootstrapped: boolean;
  isLoggedIn: boolean;
}

interface DispatchProps {
  bootstrapApp: () => void;
  signInPending: (payload: Partial<User>) => void;
  signOutPending: () => void;
}

type Props = StateProps & DispatchProps;

const App: React.FC<Props> = ({
  isBootstrapped,
  bootstrapApp,
  signInPending,
  signOutPending
}) => {
  useEffect(() => {
    if (!isBootstrapped) {
      bootstrapApp();
    }
  });

  return (
    <Switch>
      <PrivateRoute exact path="/">
        <MainLayout signOutPending={signOutPending}>
          <TransactionList />
        </MainLayout>
      </PrivateRoute>
      <Route path="/signin">
        <SignIn signInPending={signInPending} />
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
  bootstrapApp: bootstrap,
  signInPending,
  signOutPending
};

export default connect(mapStateToProps, dispatchProps)(App);
