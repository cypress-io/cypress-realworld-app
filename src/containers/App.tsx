import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { connect } from "react-redux";

import { bootstrap } from "../actions/app";
import { signInPending, SignInPendingPayload } from "../actions/auth";
import { IAppState } from "../reducers";
import TransactionList from "../components/TransactionList";
import PrivateRoute from "../components/PrivateRoute";
import Layout from "../components/Layout";
import SignIn from "../components/SignIn";

export interface OwnProps {
  history?: object;
}

interface StateProps {
  isBootstrapped: boolean;
  isLoggedIn: boolean;
}

interface DispatchProps {
  bootstrapApp: () => void;
  signInPending: (payload: SignInPendingPayload) => void;
}

type Props = StateProps & DispatchProps & OwnProps;

const App: React.FC<Props> = ({
  isBootstrapped,
  bootstrapApp,
  signInPending
}) => {
  useEffect(() => {
    if (!isBootstrapped) {
      bootstrapApp();
    }
  });

  return (
    <Switch>
      <PrivateRoute exact path="/">
        <Layout>
          <TransactionList />
        </Layout>
      </PrivateRoute>
      <Route path="/signin">
        <SignIn signInPending={signInPending} />
      </Route>
    </Switch>
  );
};

const mapStateToProps = (state: IAppState, ownProps: OwnProps) => ({
  history: ownProps.history,
  isBootstrapped: state.app.isBootstrapped,
  isLoggedIn: state.user.isLoggedIn
});

const dispatchProps = {
  bootstrapApp: bootstrap,
  signInPending
};

export default connect(mapStateToProps, dispatchProps)(App);
