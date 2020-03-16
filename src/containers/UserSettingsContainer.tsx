import React from "react";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import { User } from "../models";
import UserSettingsForm from "../components/UserSettingsForm";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

export interface Props {
  currentUser?: User;
  updateUser: Function;
}

const UserSettingsContainer: React.FC<Props> = ({
  currentUser,
  updateUser
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        User Settings
      </Typography>
      {currentUser && (
        <UserSettingsForm userProfile={currentUser} updateUser={updateUser} />
      )}
    </Paper>
  );
};
export default UserSettingsContainer;
