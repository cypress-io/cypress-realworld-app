import React from "react";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { IRootReducerState } from "../reducers";
import { BankAccount } from "../models";
import BankAccountList from "../components/BankAccountList";
import { Grid, Button } from "@material-ui/core";
import { bankAccountDeletePending } from "../actions/bankaccounts";

export interface DispatchProps {
  deleteBankAccount: Function;
}

export interface StateProps {
  bankAccounts: BankAccount[];
}

export type BankAccountsContainerProps = DispatchProps & StateProps;

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));
const BankAccountsContainer: React.FC<BankAccountsContainerProps> = ({
  bankAccounts,
  deleteBankAccount
}) => {
  const classes = useStyles();
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
        bankAccounts={bankAccounts}
        deleteBankAccount={deleteBankAccount}
      />
    </Paper>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  bankAccounts: state.bankaccounts.all
});

const mapDispatchToProps = {
  deleteBankAccount: bankAccountDeletePending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BankAccountsContainer);
