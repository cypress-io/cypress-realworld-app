import React, { useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Box, useTheme, useMediaQuery, Grid } from "@material-ui/core";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import { useService, useMachine } from "@xstate/react";
import { userOnboardingMachine } from "../machines/userOnboardingMachine";
import { isEmpty } from "lodash/fp";
import BankAccountForm from "../components/BankAccountForm";
import { DataContext, DataEvents } from "../machines/dataMachine";
import { ReactComponent as NavigatorIllustration } from "../svgs/undraw_navigator_a479.svg";
import { ReactComponent as PersonalFinance } from "../svgs/undraw_personal_finance_tqcd.svg";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
  bankAccountsService: Interpreter<DataContext, any, DataEvents, any>;
}

const UserOnboardingContainer: React.FC<Props> = ({ authService, bankAccountsService }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [bankAccountsState, sendBankAccounts] = useService(bankAccountsService);
  const [authState, sendAuth] = useService(authService);
  const [userOnboardingState, sendUserOnboarding] = useMachine(userOnboardingMachine);

  const currentUser = authState?.context?.user;

  useEffect(() => {
    sendBankAccounts("FETCH");
  }, [sendBankAccounts]);

  const noBankAccounts =
    bankAccountsState?.matches("success.withoutData") &&
    isEmpty(bankAccountsState?.context?.results);

  const dialogIsOpen =
    (userOnboardingState.matches("stepTwo") && !noBankAccounts) ||
    (userOnboardingState.matches("stepThree") && !noBankAccounts) ||
    (!userOnboardingState.matches("done") && noBankAccounts) ||
    false;

  const nextStep = () => sendUserOnboarding("NEXT");

  const createBankAccountWithNextStep = (payload: any) => {
    sendBankAccounts({ type: "CREATE", ...payload });
    nextStep();
  };

  return (
    <Dialog data-test="user-onboarding-dialog" fullScreen={fullScreen} open={dialogIsOpen}>
      <DialogTitle data-test="user-onboarding-dialog-title">
        {userOnboardingState.matches("stepOne") && "Get Started with Real World App"}
        {userOnboardingState.matches("stepTwo") && "Create Bank Account"}
        {userOnboardingState.matches("stepThree") && "Finished"}
      </DialogTitle>
      <DialogContent data-test="user-onboarding-dialog-content">
        <Box display="flex" alignItems="center" justifyContent="center">
          {userOnboardingState.matches("stepOne") && (
            <>
              <NavigatorIllustration />
              <br />
              <DialogContentText style={{ paddingLeft: 20 }}>
                Real World App requires a Bank Account to perform transactions.
                <br />
                <br />
                Click <b>Next</b> to begin setup of your Bank Account.
              </DialogContentText>
            </>
          )}
          {userOnboardingState.matches("stepTwo") && (
            <BankAccountForm
              userId={currentUser?.id!}
              createBankAccount={createBankAccountWithNextStep}
              onboarding
            />
          )}
          {userOnboardingState.matches("stepThree") && (
            <>
              <PersonalFinance />
              <br />
              <DialogContentText style={{ paddingLeft: 20 }}>
                You're all set!
                <br />
                <br />
                We're excited to have you aboard the Real World App!
              </DialogContentText>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Grid container justify="space-between">
          <Grid item>
            <Button
              style={{ paddingRight: "80%" }}
              onClick={/* istanbul ignore next */ () => sendAuth("LOGOUT")}
              color="secondary"
              data-test="user-onboarding-logout"
            >
              Logout
            </Button>
          </Grid>
          <Grid item>
            {!userOnboardingState.matches("stepTwo") && (
              <Button onClick={() => nextStep()} color="primary" data-test="user-onboarding-next">
                {userOnboardingState.matches("stepThree") ? "Done" : "Next"}
              </Button>
            )}
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default UserOnboardingContainer;
