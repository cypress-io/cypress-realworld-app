import React from "react";
import { styled } from "@mui/material/styles";
import { ListItem, ListItemText, ListItemAvatar, Avatar, Grid } from "@mui/material";

import { User } from "../models";

const PREFIX = "UserListItem";

const classes = {
  root: `${PREFIX}-root`,
};

const StyledListItem = styled(ListItem)(({ theme }) => ({
  [`&.${classes.root}`]: {
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    borderLeft: "3px solid transparent",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderLeftColor: theme.palette.primary.main,
      transform: "translateX(4px)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
    },
  },
}));

export interface UserListItemProps {
  user: User;
  setReceiver: Function;
  index: Number;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, setReceiver, index }) => {
  return (
    <StyledListItem 
      className={classes.root}
      data-test={`user-list-item-${user.id}`} 
      onClick={() => setReceiver(user)}
    >
      <ListItemAvatar>
        <Avatar src={user.avatar} />
      </ListItemAvatar>
      <ListItemText
        primary={`${user.firstName} ${user.lastName}`}
        secondary={
          <span>
            <Grid
              component={"span"}
              container
              direction="row"
              justifyContent="flex-start"
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
    </StyledListItem>
  );
};

export default UserListItem;
