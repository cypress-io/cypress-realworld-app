import React from "react";

import ListItem from "@material-ui/core/ListItem";
import LikeIcon from "@material-ui/icons/ThumbUpAltOutlined";
import PaymentIcon from "@material-ui/icons/Payment";
import CommentIcon from "@material-ui/icons/CommentRounded";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import { NotificationResponseItem } from "../models";
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
  notification: NotificationResponseItem;
  updateNotification: Function;
}

const useStyles = makeStyles({
  card: {
    minWidth: "100%"
  },
  title: {
    fontSize: 18
  },
  green: {
    color: "#4CAF50"
  },
  red: {
    color: "red"
  }
});

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  updateNotification
}) => {
  const classes = useStyles();
  let listItemText = undefined;
  let listItemIcon = undefined;

  if (isCommentNotification(notification)) {
    listItemIcon = <CommentIcon />;
    listItemText = `${notification.userFullName} commented on a transaction.`;
  }

  if (isLikeNotification(notification)) {
    listItemIcon = <LikeIcon />;
    listItemText = `${notification.userFullName} liked a transaction.`;
  }

  if (isPaymentNotification(notification)) {
    if (isPaymentRequestedNotification(notification)) {
      listItemIcon = <PaymentIcon className={classes.red} />;
      listItemText = `${notification.userFullName} requested payment.`;
    } else if (isPaymentReceivedNotification(notification)) {
      listItemIcon = <MonetizationOnIcon className={classes.green} />;
      listItemText = `${notification.userFullName} received payment.`;
    } else {
      // otherwise, incomplete payment notification
      listItemText = `An error occurred with payment to ${notification.userFullName}.`;
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
            {listItemIcon}
            {"     "}
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
