import React from "react";
import { styled } from "@mui/material/styles";
import { Paper } from "@mui/material";
import UsersList from "./UsersList";
import { User } from "../models";
import UserListSearchForm from "./UserListSearchForm";

const PREFIX = "TransactionCreateStepOne";

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
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
  return (
    <StyledPaper className={classes.paper} elevation={0}>
      <UserListSearchForm userListSearch={userListSearch} />
      <UsersList users={users} setReceiver={setReceiver} />
    </StyledPaper>
  );
};

export default TransactionCreateStepOne;
