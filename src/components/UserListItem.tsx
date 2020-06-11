import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { User } from "../models";
import { ListItemText, ListItemAvatar, Avatar, Grid } from "@material-ui/core";

export interface UserListItemProps {
  user: User;
  setReceiver: Function;
  index: Number;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, setReceiver, index }) => {
  return (
    <ListItem data-test={`user-list-item-${user.id}`} onClick={() => setReceiver(user)}>
      <ListItemAvatar>
        <Avatar src={`https://i.pravatar.cc/100?img=${index}`} />
      </ListItemAvatar>
      <ListItemText
        primary={`${user.firstName} ${user.lastName}`}
        secondary={
          <span>
            <Grid
              component={"span"}
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              spacing={1}
            >
              <Grid item component={"span"}>
                <b>U: </b>
                {user.username}
              </Grid>
              <Grid item component={"span"}>
                &bull;
              </Grid>
              <Grid item component={"span"}>
                <b>E: </b>
                {user.email}
              </Grid>
              <Grid item component={"span"}>
                &bull;
              </Grid>
              <Grid item component={"span"}>
                <b>P: </b>
                {user.phoneNumber}
              </Grid>
            </Grid>
          </span>
        }
      />
    </ListItem>
  );
};

export default UserListItem;
