import React from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import BankAccountItem from "./BankAccountItem";
import List from "@material-ui/core/List";
import { BankAccount } from "../models";

export interface BankAccountListProps {
  bankAccounts: BankAccount[];
}

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

const BankAccountList: React.FC<BankAccountListProps> = ({ bankAccounts }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        BankAccounts
      </Typography>
      <List data-test="bankaccount-list">
        {bankAccounts &&
          bankAccounts.map((bankAccount: BankAccount) => (
            <BankAccountItem key={bankAccount.id} bankAccount={bankAccount} />
          ))}
      </List>
    </Paper>
  );
};

export default BankAccountList;
