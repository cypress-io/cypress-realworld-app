import React from "react";

import NotificationListItem from "./NotificationListItem";
import List from "@material-ui/core/List";
import { NotificationResponseItem } from "../models";
import EmptyList from "./EmptyList";

export interface NotificationsListProps {
  notifications: NotificationResponseItem[];
  updateNotification: Function;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  updateNotification,
}) => {
  return (
    <>
      {notifications.length > 0 ? (
        <List data-test="notifications-list">
          {notifications.map((notification: NotificationResponseItem) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              updateNotification={updateNotification}
            />
          ))}
        </List>
      ) : (
        <EmptyList entity="Notifications" />
      )}
    </>
  );
};

export default NotificationsList;
