import React from "react";

import {
  Check as CheckIcon,
  ThumbUpAltOutlined as LikeIcon,
  Payment as PaymentIcon,
  CommentRounded as CommentIcon,
  MonetizationOn as MonetizationOnIcon,
} from "@material-ui/icons";
import {
  Button,
  makeStyles,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  ListItem,
  IconButton,
} from "@material-ui/core";
import {
  isCommentNotification,
  isLikeNotification,
  isPaymentNotification,
  isPaymentRequestedNotification,
  isPaymentReceivedNotification,
} from "../utils/transactionUtils";
import { NotificationResponseItem } from "../models";

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
