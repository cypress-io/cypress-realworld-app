import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { NotificationType } from "../models";
import NotificationList from "../components/NotificationList";

export interface StateProps {
  allNotifications: NotificationType[];
}

export type NotificationsContainerProps = StateProps;

const NotificationsContainer: React.FC<NotificationsContainerProps> = ({
  allNotifications
}) => {
  return (
    <MainContainer>
      <br />
      <NotificationList notifications={allNotifications} />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  allNotifications: state.notifications.all
});

export default connect(mapStateToProps)(NotificationsContainer);
