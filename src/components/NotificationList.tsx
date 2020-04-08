import React from "react";

import NotificationListItem from "./NotificationListItem";
import List from "@material-ui/core/List";
import { NotificationResponseItem } from "../models";
import EmptyList from "./EmptyList";
import { ReactComponent as RemindersIllustration } from "../svgs/undraw_reminders_697p.svg";

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
      {notifications?.length > 0 ? (
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
        <EmptyList entity="Notifications">
          <RemindersIllustration
            style={{ height: 200, width: 250, marginBottom: 30 }}
          />
        </EmptyList>
      )}
    </>
  );
};

export default NotificationsList;
