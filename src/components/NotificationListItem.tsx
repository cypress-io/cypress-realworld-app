import React from "react";

import { styled } from "@mui/material/styles";

import {
  Check as CheckIcon,
  ThumbUpAltOutlined as LikeIcon,
  Payment as PaymentIcon,
  CommentRounded as CommentIcon,
  MonetizationOn as MonetizationOnIcon,
} from "@mui/icons-material";
import {
  Button,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  ListItem,
  IconButton,
} from "@mui/material";
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

const PREFIX = "NotificationListItem";

const classes = {
  card: `${PREFIX}-card`,
  title: `${PREFIX}-title`,
  green: `${PREFIX}-green`,
  red: `${PREFIX}-red`,
  blue: `${PREFIX}-blue`,
};

const StyledListItem = styled(ListItem)({
  [`& .${classes.card}`]: {
    minWidth: "100%",
  },
  [`& .${classes.title}`]: {
    fontSize: 18,
  },
  [`& .${classes.green}`]: {
    color: "#4CAF50",
  },
  [`& .${classes.red}`]: {
    color: "red",
  },
  [`& .${classes.blue}`]: {
    color: "blue",
  },
});

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  updateNotification,
}) => {
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
    <StyledListItem data-test={`notification-list-item-${notification.id}`}>
      <ListItemIcon>{listItemIcon!}</ListItemIcon>
      <ListItemText primary={listItemText} />
      {xsBreakpoint && (
        <IconButton
          aria-label="mark as read"
          color="primary"
          onClick={() => updateNotification({ id: notification.id, isRead: true })}
          data-test={`notification-mark-read-${notification.id}`}
          size="large"
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
    </StyledListItem>
  );
};

export default NotificationListItem;
