import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { User } from "../models";
import { ListItemText } from "@material-ui/core";

export interface UserListItemProps {
  user: User;
  setReceiver: Function;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, setReceiver }) => {
  return (
    <ListItem
      data-test={`user-list-item-${user.id}`}
      onClick={() => setReceiver(user)}
    >
      <ListItemText primary={`${user.firstName} ${user.lastName}`} />
    </ListItem>
  );
};

export default UserListItem;
