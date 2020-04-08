import React, { useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Box, useTheme, useMediaQuery } from "@material-ui/core";
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

const UserOnboardingContainer: React.FC<Props> = ({
  authService,
  bankAccountsService,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [bankAccountsState, sendBankAccounts] = useService(bankAccountsService);
  const [authState] = useService(authService);
  const [
    userOnboardingState,
    sendUserOnboarding,
  ] = useMachine(userOnboardingMachine, { devTools: true });

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
    sendBankAccounts("CREATE", payload);
    nextStep();
  };

  return (
    <Dialog
      data-test="user-onboarding-dialog"
      fullScreen={fullScreen}
      open={dialogIsOpen}
    >
      <DialogTitle data-test="user-onboarding-dialog-title">
        {userOnboardingState.matches("stepOne") && "Get Started with Pay App"}
        {userOnboardingState.matches("stepTwo") && "Create Bank Account"}
        {userOnboardingState.matches("stepThree") && "Finished"}
      </DialogTitle>
      <DialogContent data-test="user-onboarding-dialog-content">
        <Box
          display="flex"
          min-height={theme.spacing(36)}
          width={theme.spacing(68)}
          height={theme.spacing(36)}
          alignItems="center"
          justifyContent="center"
        >
          {userOnboardingState.matches("stepOne") && (
            <>
              <NavigatorIllustration />
              <br />
              <DialogContentText style={{ paddingLeft: 20 }}>
                Pay App requires a Bank Account to perform transactions.
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
                We're excited to have you aboard Pay App!
              </DialogContentText>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {!userOnboardingState.matches("stepTwo") && (
          <Button
            onClick={() => nextStep()}
            color="primary"
            autoFocus
            data-test="user-onboarding-next"
          >
            {userOnboardingState.matches("stepThree")
              ? "Take me to Pay App"
              : "Next"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserOnboardingContainer;
