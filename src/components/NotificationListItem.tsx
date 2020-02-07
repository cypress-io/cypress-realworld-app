import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { NotificationType } from "../models";
import { ListItemText } from "@material-ui/core";

export interface NotificationListItemProps {
  notification: NotificationType;
}

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification
}) => {
  return (
    <ListItem data-test={`notification-list-item-${notification.id}`}>
      <ListItemText primary={`ID: ${notification.id}`} />
    </ListItem>
  );
};

export default NotificationListItem;
