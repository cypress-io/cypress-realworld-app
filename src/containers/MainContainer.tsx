import React from "react";
import { connect } from "react-redux";
import { signOutPending } from "../actions/auth";
import MainLayout from "../components/MainLayout";
import { IRootReducerState } from "../reducers";
import { NotificationType, User } from "../models";

export interface StateProps {
  allNotifications: NotificationType[];
  currentUser: User;
}

export interface DispatchProps {
  signOutPending: () => void;
}

type Props = StateProps & DispatchProps;

const MainContainer: React.FC<Props> = ({
  signOutPending,
  children,
  allNotifications,
  currentUser
}) => {
  return (
    <MainLayout
      signOutPending={signOutPending}
      allNotifications={allNotifications}
      currentUser={currentUser}
    >
      {children}
    </MainLayout>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  allNotifications: state.notifications.all,
  currentUser: state.user.profile
});

const dispatchProps = {
  signOutPending
};

export default connect(mapStateToProps, dispatchProps)(MainContainer);
