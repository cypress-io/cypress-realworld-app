import React from "react";
import { connect } from "react-redux";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import { IRootReducerState } from "../reducers";
import { User } from "../models";
import { userUpdatePending } from "../actions/users";
import UserSettingsForm from "../components/UserSettingsForm";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

export interface StateProps {
  userProfile: User;
}

export interface DispatchProps {
  updateUser: Function;
}

export type UserSettingsContainerProps = StateProps & DispatchProps;

const UserSettingsContainer: React.FC<UserSettingsContainerProps> = ({
  userProfile,
  updateUser
}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        User Settings
      </Typography>
      <UserSettingsForm userProfile={userProfile} updateUser={updateUser} />
    </Paper>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  userProfile: state.user.profile
});

const mapDispatchToProps = {
  updateUser: userUpdatePending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserSettingsContainer);
