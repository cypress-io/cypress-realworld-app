import React, { useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  makeStyles,
  Paper,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from "@material-ui/core";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import { useService, useMachine } from "@xstate/react";
import { userOnboardingMachine } from "../machines/userOnboardingMachine";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import { isEmpty } from "lodash/fp";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const UserOnboardingContainer: React.FC<Props> = ({ authService }) => {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [bankAccountsState, sendBankAccounts] = useMachine(
    bankAccountsMachine,
    { devTools: true }
  );
  const [authState, sendAuth] = useService(authService);
  const [
    userOnboardingState,
    sendUserOnboarding
  ] = useMachine(userOnboardingMachine, { devTools: true });

  const currentUser = authState.context.user;

  useEffect(() => {
    sendBankAccounts("FETCH");
  }, [sendBankAccounts]);
  /*
  const currentUser = authState.context.user;
  const updateUser = (payload: any) => sendAuth("UPDATE", payload);*/

  console.log("BA: ", bankAccountsState);
  const noBankAccounts =
    bankAccountsState.matches("success.withData") &&
    isEmpty(bankAccountsState?.context?.results);
  console.log("NBA: ", noBankAccounts);

  console.log("BA State: ", bankAccountsState.matches("success.withData"));
  console.log("RESULTS 1: ", !isEmpty(bankAccountsState?.context?.results));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={!userOnboardingState.matches("done")}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Get Started with Pay App"}
      </DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          min-height={theme.spacing(24)}
          width={theme.spacing(68)}
          height={theme.spacing(24)}
          alignItems="center"
          justifyContent="center"
        >
          {userOnboardingState.matches("stepOne") && (
            <DialogContentText>
              Pay App requires a Bank Account to perform transactions.
              <br />
              Click <b>Next</b> to begin setup of your Bank Account.
            </DialogContentText>
          )}
          {userOnboardingState.matches("stepTwo") && (
            <DialogContentText>Create Bank Account</DialogContentText>
          )}
          {userOnboardingState.matches("stepThree") && (
            <DialogContentText>
              You're all set! We're excited to have you aboard Pay App!
            </DialogContentText>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => sendUserOnboarding("NEXT")}
          color="primary"
          autoFocus
        >
          {userOnboardingState.matches("stepThree")
            ? "Take me to Pay App"
            : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserOnboardingContainer;
