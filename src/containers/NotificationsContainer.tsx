import React, { useEffect } from "react";
import { Interpreter } from "xstate";
import { useService } from "@xstate/react";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import { NotificationUpdatePayload } from "../models";
import NotificationList from "../components/NotificationList";
import { DataContext, DataSchema, DataEvents } from "../machines/dataMachine";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";

const useStyles = makeStyles((theme) => ({
  paper: {
    minHeight: "90vh",
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
  notificationsService: Interpreter<DataContext, DataSchema, DataEvents, any>;
}

const NotificationsContainer: React.FC<Props> = ({ authService, notificationsService }) => {
  const classes = useStyles();
  const [authState] = useService(authService);
  const [notificationsState, sendNotifications] = useService(notificationsService);

  useEffect(() => {
    sendNotifications({ type: "FETCH" });
  }, [authState, sendNotifications]);

  const updateNotification = (payload: NotificationUpdatePayload) =>
    sendNotifications({ type: "UPDATE", ...payload });

  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Notifications
      </Typography>
      <NotificationList
        notifications={notificationsState?.context?.results!}
        updateNotification={updateNotification}
      />
    </Paper>
  );
};

export default NotificationsContainer;
