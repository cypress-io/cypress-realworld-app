import React, { useEffect } from "react";
import { useService } from "@xstate/react";
import { Interpreter } from "xstate";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import { makeStyles, Grid, Button, Paper, Typography } from "@material-ui/core";

import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import { DataContext, DataEvents } from "../machines/dataMachine";
import BankAccountForm from "../components/BankAccountForm";
import BankAccountList from "../components/BankAccountList";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
  bankAccountsService: Interpreter<DataContext, any, DataEvents, any>;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const BankAccountsContainer: React.FC<Props> = ({ authService, bankAccountsService }) => {
  const match = useRouteMatch();
  const classes = useStyles();
  const [authState] = useService(authService);
  const [bankAccountsState, sendBankAccounts] = useService(bankAccountsService);

  const currentUser = authState?.context.user;

  const createBankAccount = (payload: any) => {
    sendBankAccounts({ type: "CREATE", ...payload });
  };

  const deleteBankAccount = (payload: any) => {
    sendBankAccounts({ type: "DELETE", ...payload });
  };

  useEffect(() => {
    sendBankAccounts("FETCH");
  }, [sendBankAccounts]);

  if (match.url === "/bankaccounts/new" && currentUser?.id) {
    return (
      <Paper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Create Bank Account
        </Typography>
        <BankAccountForm userId={currentUser?.id} createBankAccount={createBankAccount} />
      </Paper>
    );
  }

  return (
    <Paper className={classes.paper}>
      <Grid container direction="row" justify="space-between" alignItems="center">
        <Grid item>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Bank Accounts
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/bankaccounts/new"
            data-test="bankaccount-new"
          >
            Create
          </Button>
        </Grid>
      </Grid>
      <BankAccountList
        bankAccounts={bankAccountsState?.context.results!}
        deleteBankAccount={deleteBankAccount}
      />
    </Paper>
  );
};
export default BankAccountsContainer;
