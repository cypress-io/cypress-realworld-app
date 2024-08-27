import React from "react";
import { styled } from "@mui/material/styles";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { Paper, Typography, Grid, Avatar, Box, Button } from "@mui/material";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";
import {
  CreateTransactionMachineContext,
  CreateTransactionMachineEvents,
  CreateTransactionMachineSchema,
} from "../machines/createTransactionMachine";
import { useActor } from "@xstate/react";
import { formatAmount } from "../utils/transactionUtils";

const PREFIX = "TransactionCreateStepThree";

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

export interface TransactionCreateStepThreeProps {
  createTransactionService: Interpreter<
    CreateTransactionMachineContext,
    CreateTransactionMachineSchema,
    CreateTransactionMachineEvents,
    any,
    ResolveTypegenMeta<
      TypegenDisabled,
      CreateTransactionMachineEvents,
      BaseActionObject,
      ServiceMap
    >
  >;
}

const TransactionCreateStepThree: React.FC<TransactionCreateStepThreeProps> = ({
  createTransactionService,
}) => {
  const history = useHistory();

  const [createTransactionState, sendCreateTransaction] = useActor(createTransactionService);

  const receiver = createTransactionState?.context?.receiver;
  const transactionDetails = createTransactionState?.context?.transactionDetails;

  return (
    <StyledPaper className={classes.paper} elevation={0}>
      <Box
        display="flex"
        justifyContent="center"
        width="95%"
        min-height={200}
        height={200}
        style={{ paddingTop: "5%" }}
      >
        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          spacing={4}
        >
          <Grid item>
            <Grid container direction="column" justifyContent="flex-start" alignItems="center">
              <Grid item>
                <Avatar src={receiver.avatar} />
              </Grid>
              <Grid item>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  {receiver.firstName} {receiver.lastName}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        width="100%"
        height="100"
        style={{ paddingBottom: "5%" }}
      >
        <Grid container direction="row" justifyContent="center" alignItems="center">
          <Grid item>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              {transactionDetails?.transactionType === "payment" ? "Paid " : "Requested "}
              {transactionDetails?.amount &&
                formatAmount(parseInt(transactionDetails.amount, 10) * 100)}{" "}
              for {transactionDetails?.description}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        width="100%"
        height="100"
        style={{ paddingBottom: "5%" }}
      >
        <Grid container direction="row" justifyContent="space-around" alignItems="center">
          <Grid item>
            <Button
              variant="contained"
              size="small"
              component={RouterLink}
              to="/"
              data-test="new-transaction-return-to-transactions"
            >
              Return To Transactions
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="small"
              /* istanbul ignore next */
              onClick={() => {
                sendCreateTransaction("RESET");
                history.push("/transaction/new");
              }}
              data-test="new-transaction-create-another-transaction"
            >
              Create Another Transaction
            </Button>
          </Grid>
        </Grid>
      </Box>
    </StyledPaper>
  );
};

export default TransactionCreateStepThree;
