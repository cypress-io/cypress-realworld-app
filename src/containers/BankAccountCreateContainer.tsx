import React from "react";
import { connect } from "react-redux";
import { bankAccountCreatePending } from "../actions/bankAccounts";
import { User } from "../models";
import BankAccountForm from "../components/BankAccountForm";
import { IRootReducerState } from "../reducers";
import MainContainer from "./MainContainer";
import { Paper, Typography, makeStyles } from "@material-ui/core";

export interface DispatchProps {
  createBankAccount: Function;
}
export interface StateProps {
  currentUser: User;
}

export type BankAccountCreateContainerProps = StateProps & DispatchProps;

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));
const BankAccountCreateContainer: React.FC<BankAccountCreateContainerProps> = ({
  currentUser,
  createBankAccount
}) => {
  const classes = useStyles();
  return (
    <MainContainer>
      <Paper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Create Bank Account
        </Typography>
        <BankAccountForm
          userId={currentUser.id}
          createBankAccount={createBankAccount}
        />
      </Paper>
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  currentUser: state.user.profile
});

const mapDispatchToProps = {
  createBankAccount: bankAccountCreatePending
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BankAccountCreateContainer);
