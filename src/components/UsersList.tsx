import React from "react";

import UserListItem from "./UserListItem";
import List from "@material-ui/core/List";
import { User } from "../models";

export interface UsersListProps {
  users: User[];
}

const UsersList: React.FC<UsersListProps> = ({ users }) => {
  return (
    <List data-test="user-list">
      {users &&
        users.map((user: User) => <UserListItem key={user.id} user={user} />)}
    </List>
  );
};

export default UsersList;
