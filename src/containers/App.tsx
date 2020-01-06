import React, { useEffect } from "react";
import { Switch, Route } from "react-router";
import { connect } from "react-redux";
import { bootstrap } from "../actions/app";
import { IAppState } from "../reducers";
import TransactionList from "../components/TransactionList";

export interface OwnProps {
  history?: object;
}

interface StateProps {
  isBootstrapped: boolean;
}

interface DispatchProps {
  bootstrapApp: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;

const TransactionDetail = () => <div>Transaction Detail</div>;

const App: React.FC<Props> = ({ isBootstrapped, bootstrapApp }) => {
  useEffect(() => {
    if (!isBootstrapped) {
      bootstrapApp();
    }
  });

  return (
    <>
      <div>
        <Switch>
          <Route exact path="/" component={TransactionList} />
          <Route path="/t/:id" component={TransactionDetail} />
        </Switch>
      </div>
    </>
  );
};

const mapStateToProps = (state: IAppState, ownProps: OwnProps) => ({
  history: ownProps.history,
  isBootstrapped: state.app.isBootstrapped
});

const dispatchProps = {
  bootstrapApp: bootstrap
};

export default connect(mapStateToProps, dispatchProps)(App);
