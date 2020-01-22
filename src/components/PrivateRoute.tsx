import React from "react";
import { IAppState } from "../reducers";
import { connect } from "react-redux";
import { Route, Redirect, RouteProps } from "react-router-dom";

interface IPrivateRouteProps extends RouteProps {
  isLoggedIn: boolean;
}

function PrivateRoute({ isLoggedIn, children, ...rest }: IPrivateRouteProps) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

const mapStateToProps = (state: IAppState) => {
  return {
    isLoggedIn: state.app.isLoggedIn
  };
};

export default connect(mapStateToProps)(PrivateRoute);
