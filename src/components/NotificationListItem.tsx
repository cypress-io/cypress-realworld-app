import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { NotificationType, PaymentNotification } from "../models";
import { ListItemText } from "@material-ui/core";
import {
  isCommentNotification,
  isLikeNotification,
  isPaymentNotification,
  isPaymentRequestedNotification,
  isPaymentReceivedNotification
} from "../utils/transactionUtils";

export interface NotificationListItemProps {
  notification: NotificationType;
}

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification
}) => {
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
      <ListItemText primary={listItemText} />
    </ListItem>
  );
};

export default NotificationListItem;
