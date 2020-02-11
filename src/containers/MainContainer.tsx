import React from "react";
import { connect } from "react-redux";
import { signOutPending } from "../actions/auth";
import MainLayout from "../components/MainLayout";
import { IRootReducerState } from "../reducers";
import { NotificationType } from "../models";

export interface StateProps {
  allNotifications: NotificationType[];
}

export interface DispatchProps {
  signOutPending: () => void;
}

type Props = StateProps & DispatchProps;

const MainContainer: React.FC<Props> = ({
  signOutPending,
  children,
  allNotifications
}) => {
  return (
    <MainLayout
      signOutPending={signOutPending}
      allNotifications={allNotifications}
    >
      {children}
    </MainLayout>
  );
};
const mapStateToProps = (state: IRootReducerState) => ({
  allNotifications: state.notifications.all
});
const dispatchProps = {
  signOutPending
};

export default connect(mapStateToProps, dispatchProps)(MainContainer);
