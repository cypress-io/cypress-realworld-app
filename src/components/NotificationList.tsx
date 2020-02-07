import React from "react";

import NotificationListItem from "./NotificationListItem";
import List from "@material-ui/core/List";
import { NotificationType } from "../models";

export interface NotificationsListProps {
  notifications: NotificationType[];
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications
}) => {
  return (
    <List data-test="notifications-list">
      {notifications &&
        notifications.map((notification: NotificationType) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
          />
        ))}
    </List>
  );
};

export default NotificationsList;
