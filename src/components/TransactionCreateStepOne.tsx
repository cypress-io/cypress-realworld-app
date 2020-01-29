import React from "react";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import MainContainer from "../containers/MainContainer";
import UsersList from "./UsersList";
import { User } from "../models";

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
  setReceiver: Function;
}

const TransactionCreateStepOne: React.FC<TransactionCreateStepOneProps> = ({
  allUsers,
  setReceiver
}) => {
  const classes = useStyles();
  return (
    <MainContainer>
      <Paper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Select User
        </Typography>
        {/* TODO: search form here */}
        {/* TODO: searchUsers or allUsers */}
        <UsersList users={allUsers} setReceiver={setReceiver} />
      </Paper>
    </MainContainer>
  );
};

export default TransactionCreateStepOne;
