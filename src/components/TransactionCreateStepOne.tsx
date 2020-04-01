import React from "react";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import UsersList from "./UsersList";
import { User } from "../models";
import UserListSearchForm from "./UserListSearchForm";

const useStyles = makeStyles((theme) => ({
  paper: {
    //marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

export interface TransactionCreateStepOneProps {
  setReceiver: Function;
  userListSearch: Function;
  users: User[];
}

const TransactionCreateStepOne: React.FC<TransactionCreateStepOneProps> = ({
  setReceiver,
  userListSearch,
  users,
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper} elevation={0}>
      {/*<Typography component="h2" variant="h6" color="primary" gutterBottom>
        Select User
  </Typography>*/}
      <UserListSearchForm userListSearch={userListSearch} />
      <UsersList users={users} setReceiver={setReceiver} />
    </Paper>
  );
};

export default TransactionCreateStepOne;
