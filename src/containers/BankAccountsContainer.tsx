import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import BankAccountList from "../components/BankAccountList";
import { Grid, Button } from "@material-ui/core";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

const BankAccountsContainer: React.FC = () => {
  const classes = useStyles();
  const [bankAccountsState, sendBankAccounts] = useMachine(
    bankAccountsMachine,
    { devTools: true }
  );

  const deleteBankAccount = (payload: any) => {
    sendBankAccounts("DELETE", payload);
  };

  useEffect(() => {
    sendBankAccounts("FETCH");
  }, [sendBankAccounts]);

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
            to="/bankaccount/new"
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
