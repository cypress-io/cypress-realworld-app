import React from "react";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import UsersList from "./UsersList";
import { User } from "../models";
import UserListSearchForm from "./UserListSearchForm";
import { isEmpty } from "lodash/fp";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

export interface TransactionCreateStepOneProps {
  allUsers: User[];
  searchUsers: User[];
  setReceiver: Function;
  userListSearch: Function;
}

const TransactionCreateStepOne: React.FC<TransactionCreateStepOneProps> = ({
  allUsers,
  searchUsers,
  setReceiver,
  userListSearch
}) => {
  const classes = useStyles();
  const users = !isEmpty(searchUsers) ? searchUsers : allUsers;
  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Select User
      </Typography>
      <UserListSearchForm userListSearch={userListSearch} />
      <UsersList users={users} setReceiver={setReceiver} />
    </Paper>
  );
};

export default TransactionCreateStepOne;
