import React from "react";
import { connect } from "react-redux";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { NotificationType } from "../models";
import NotificationList from "../components/NotificationList";
import { notificationUpdatePending } from "../actions/notifications";
const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));
export interface StateProps {
  allNotifications: NotificationType[];
  updateNotification: Function;
}

export type NotificationsContainerProps = StateProps;

const NotificationsContainer: React.FC<NotificationsContainerProps> = ({
  allNotifications,
  updateNotification
}) => {
  const classes = useStyles();
  return (
    <MainContainer>
      <Paper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Notifications
        </Typography>
        <NotificationList
          notifications={allNotifications}
          updateNotification={updateNotification}
        />
      </Paper>
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  allNotifications: state.notifications.all
});

const mapDispatchToProps = {
  updateNotification: notificationUpdatePending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationsContainer);
