import React from "react";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { BankAccount } from "../models";
import BankAccountList from "../components/BankAccountList";
import { Grid, Button } from "@material-ui/core";

export interface StateProps {
  bankAccounts: BankAccount[];
}

export type BankAccountsContainerProps = StateProps;

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));
const BankAccountsContainer: React.FC<BankAccountsContainerProps> = ({
  bankAccounts
}) => {
  const classes = useStyles();
  return (
    <MainContainer>
      <Paper className={classes.paper}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Bank Accounts
            </Typography>
          </Grid>
          <Grid item>
            <Button
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
        <BankAccountList bankAccounts={bankAccounts} />
      </Paper>
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  bankAccounts: state.bankaccounts.all
});

export default connect(mapStateToProps)(BankAccountsContainer);
