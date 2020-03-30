import React from "react";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import UserSettingsForm from "../components/UserSettingsForm";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import { useService } from "@xstate/react";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const UserSettingsContainer: React.FC<Props> = ({ authService }) => {
  const classes = useStyles();
  const [authState, sendAuth] = useService(authService);

  const currentUser = authState.context.user;
  const updateUser = (payload: any) => sendAuth("UPDATE", payload);

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
