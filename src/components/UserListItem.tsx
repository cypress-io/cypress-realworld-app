import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { User } from "../models";
import { ListItemText, ListItemAvatar, Avatar, Grid } from "@material-ui/core";

export interface UserListItemProps {
  user: User;
  setReceiver: Function;
  index: Number;
}

const UserListItem: React.FC<UserListItemProps> = ({
  user,
  setReceiver,
  index,
}) => {
  return (
    <ListItem
      data-test={`user-list-item-${user.id}`}
      onClick={() => setReceiver(user)}
    >
      <ListItemAvatar>
        <Avatar src={`https://i.pravatar.cc/100?img=${index}`} />
      </ListItemAvatar>
      <ListItemText
        primary={`${user.firstName} ${user.lastName}`}
        secondary={
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid item>
              <b>U: </b>
              {user.username}
            </Grid>
            <Grid item>&bull;</Grid>
            <Grid item>
              <b>E: </b>
              {user.email}
            </Grid>
            <Grid item>&bull;</Grid>
            <Grid item>
              <b>P: </b>
              {user.phoneNumber}
            </Grid>
          </Grid>
        }
      />
    </ListItem>
  );
};

export default UserListItem;
