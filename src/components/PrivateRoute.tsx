import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";

interface IPrivateRouteProps extends RouteProps {
  isLoggedIn: boolean;
}

function PrivateRoute({ isLoggedIn, children, ...rest }: IPrivateRouteProps) {
  console.log("PR isLoggedIn:", isLoggedIn);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoggedIn ? (
          children
        ) : (
          /* istanbul ignore next */
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

export default PrivateRoute;
