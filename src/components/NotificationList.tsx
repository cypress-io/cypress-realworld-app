import React from "react";

import NotificationListItem from "./NotificationListItem";
import List from "@material-ui/core/List";
import { NotificationType } from "../models";

export interface NotificationsListProps {
  notifications: NotificationType[];
  updateNotification: Function;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  updateNotification
}) => {
  return (
    <List data-test="notifications-list">
      {notifications &&
        notifications.map((notification: NotificationType) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
            updateNotification={updateNotification}
          />
        ))}
    </List>
  );
};

export default NotificationsList;
