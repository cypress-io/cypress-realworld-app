import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import BankAccountList from "../components/BankAccountList";
import { Grid, Button } from "@material-ui/core";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import { User } from "../models";
import BankAccountForm from "../components/BankAccountForm";

export interface Props {
  currentUserId?: User["id"];
}

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

const BankAccountsContainer: React.FC<Props> = ({ currentUserId }) => {
  const match = useRouteMatch();
  const classes = useStyles();
  const [bankAccountsState, sendBankAccounts] = useMachine(
    bankAccountsMachine,
    { devTools: true }
  );

  const createBankAccount = (payload: any) => {
    sendBankAccounts("CREATE", payload);
  };

  const deleteBankAccount = (payload: any) => {
    sendBankAccounts("DELETE", payload);
  };

  useEffect(() => {
    sendBankAccounts("FETCH");
  }, [sendBankAccounts]);

  if (match.url === "/bankaccounts/new" && currentUserId) {
    return (
      <Paper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Create Bank Account
        </Typography>
        <BankAccountForm
          userId={currentUserId}
          createBankAccount={createBankAccount}
        />
      </Paper>
    );
  }

  return (
    <Paper className={classes.paper}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
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
        bankAccounts={bankAccountsState.context.results!}
        deleteBankAccount={deleteBankAccount}
      />
    </Paper>
  );
};
export default BankAccountsContainer;
