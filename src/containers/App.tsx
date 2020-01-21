import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { connect } from "react-redux";

import { bootstrap } from "../actions/app";
import { IAppState } from "../reducers";
import TransactionList from "../components/TransactionList";
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
}

type Props = StateProps & DispatchProps & OwnProps;

const App: React.FC<Props> = ({ isBootstrapped, bootstrapApp }) => {
  useEffect(() => {
    if (!isBootstrapped) {
      bootstrapApp();
    }
  });

  return (
    <Switch>
      <Route exact path="/signin" component={SignIn} />
      <Route exact path="/">
        <Layout>
          <TransactionList />
        </Layout>
      </Route>
    </Switch>
  );
};

const mapStateToProps = (state: IAppState, ownProps: OwnProps) => ({
  history: ownProps.history,
  isBootstrapped: state.app.isBootstrapped,
  isLoggedIn: state.app.isLoggedIn
});

const dispatchProps = {
  bootstrapApp: bootstrap
};

export default connect(mapStateToProps, dispatchProps)(App);
