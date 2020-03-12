import React from "react";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import { NotificationResponseItem } from "../models";
import NotificationList from "../components/NotificationList";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

export interface Props {
  notifications: NotificationResponseItem[];
  updateNotification: Function;
}

const NotificationsContainer: React.FC<Props> = ({
  notifications,
  updateNotification
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Notifications
      </Typography>
      <NotificationList
        notifications={notifications}
        updateNotification={updateNotification}
      />
    </Paper>
  );
};

export default NotificationsContainer;
