import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { connect } from "react-redux";

import { bootstrap } from "../actions/app";
import { IRootReducerState } from "../reducers";
import TransactionList from "../components/TransactionList";
import PrivateRoute from "../components/PrivateRoute";
import MainContainer from "../containers/MainContainer";
import SignIn from "../containers/SignIn";
import SignUp from "../containers/SignUp";

interface StateProps {
  isBootstrapped: boolean;
  isLoggedIn: boolean;
}

interface DispatchProps {
  bootstrapApp: () => void;
}

type Props = StateProps & DispatchProps;

const App: React.FC<Props> = ({ isBootstrapped, bootstrapApp }) => {
  useEffect(() => {
    if (!isBootstrapped) {
      bootstrapApp();
    }
  });

  return (
    <Switch>
      <PrivateRoute exact path="/">
        <MainContainer>
          <TransactionList />
        </MainContainer>
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
