import React from "react";

import ListItem from "@material-ui/core/ListItem";
import LikeIcon from "@material-ui/icons/ThumbUpAltOutlined";
import PaymentIcon from "@material-ui/icons/Payment";
import CommentIcon from "@material-ui/icons/CommentRounded";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
// import HourglassEmpty from "@material-ui/icons/HourglassEmpty";
import { NotificationResponseItem } from "../models";
import {
  Button,
  makeStyles,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import {
  isCommentNotification,
  isLikeNotification,
  isPaymentNotification,
  isPaymentRequestedNotification,
  isPaymentReceivedNotification,
  // isPaymentPendingNotification,
} from "../utils/transactionUtils";

export interface NotificationListItemProps {
  notification: NotificationResponseItem;
  updateNotification: Function;
}

const useStyles = makeStyles({
  card: {
    minWidth: "100%",
  },
  title: {
    fontSize: 18,
  },
  green: {
    color: "#4CAF50",
  },
  red: {
    color: "red",
  },
  blue: {
    color: "blue",
  },
});

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  updateNotification,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  let listItemText = undefined;
  let listItemIcon = undefined;
  const xsBreakpoint = useMediaQuery(theme.breakpoints.only("xs"));

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
      <ListItemIcon>{listItemIcon!}</ListItemIcon>
      <ListItemText primary={listItemText} />
      {xsBreakpoint && (
        <IconButton
          aria-label="mark as read"
          color="primary"
          onClick={() => updateNotification({ id: notification.id, isRead: true })}
          data-test={`notification-mark-read-${notification.id}`}
        >
          <CheckIcon />
        </IconButton>
      )}
      {!xsBreakpoint && (
        <Button
          color="primary"
          size="small"
          onClick={() => updateNotification({ id: notification.id, isRead: true })}
          data-test={`notification-mark-read-${notification.id}`}
        >
          Dismiss
        </Button>
      )}
    </ListItem>
  );
};

export default NotificationListItem;
