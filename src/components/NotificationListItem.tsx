import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { NotificationType } from "../models";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  makeStyles
} from "@material-ui/core";
import {
  isCommentNotification,
  isLikeNotification,
  isPaymentNotification,
  isPaymentRequestedNotification,
  isPaymentReceivedNotification
} from "../utils/transactionUtils";

export interface NotificationListItemProps {
  notification: NotificationType;
  updateNotification: Function;
}

const useStyles = makeStyles({
  card: {
    minWidth: "100%"
  },
  title: {
    fontSize: 18
  }
});

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  updateNotification
}) => {
  const classes = useStyles();
  let listItemText = undefined;

  if (isCommentNotification(notification)) {
    listItemText = `${notification.id} ${notification.userFullName} commented on a transaction.`;
  }

  if (isLikeNotification(notification)) {
    listItemText = `${notification.id} ${notification.userFullName} liked a transaction.`;
  }

  if (isPaymentNotification(notification)) {
    if (isPaymentRequestedNotification(notification)) {
      listItemText = `${notification.id} ${notification.userFullName} requested payment.`;
    } else if (isPaymentReceivedNotification(notification)) {
      listItemText = `${notification.id} ${notification.userFullName} received payment.`;
    } else {
      // otherwise, incomplete payment notification
      listItemText = `${notification.id} An error occurred with payment to ${notification.userFullName}.`;
    }
  }

  return (
    <ListItem data-test={`notification-list-item-${notification.id}`}>
      <Card className={classes.card}>
        <CardContent>
          <Typography
            variant="body2"
            className={classes.title}
            color="textSecondary"
          >
            {listItemText}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            color="primary"
            size="small"
            onClick={() =>
              updateNotification({ id: notification.id, isRead: true })
            }
            data-test={`notification-mark-read-${notification.id}`}
          >
            Mark as read
          </Button>
        </CardActions>
      </Card>
    </ListItem>
  );
};

export default NotificationListItem;
