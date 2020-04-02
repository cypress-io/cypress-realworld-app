import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography, Grid, Avatar, Box } from "@material-ui/core";
import { random } from "lodash/fp";
import { Interpreter } from "xstate";
import {
  CreateTransactionMachineContext,
  CreateTransactionMachineEvents,
} from "../machines/createTransactionMachine";
import { useService } from "@xstate/react";
import { formatAmount } from "../utils/transactionUtils";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

export interface TransactionCreateStepThreeProps {
  createTransactionService: Interpreter<
    CreateTransactionMachineContext,
    any,
    CreateTransactionMachineEvents,
    any
  >;
}

const TransactionCreateStepThree: React.FC<TransactionCreateStepThreeProps> = ({
  createTransactionService,
}) => {
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [createTransactionState, sendCreateTransaction] = useService(
    createTransactionService
  );

  const receiver = createTransactionState?.context?.receiver;
  const transactionDetails =
    createTransactionState?.context?.transactionDetails;

  return (
    <Paper className={classes.paper} elevation={0}>
      <Box
        display="flex"
        //height={200}
        alignItems="center"
        justifyContent="center"
      >
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          <Grid item>
            <Avatar src={`https://i.pravatar.cc/100?img=${random(3, 50)}`} />
          </Grid>
          <Grid item>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              You
            </Typography>
          </Grid>
          <Grid item>
            <Avatar src={`https://i.pravatar.cc/100?img=${random(3, 50)}`} />
          </Grid>
          <Grid item>
            {transactionDetails?.transactionType === "payment"
              ? "Paid"
              : "Requested"}
          </Grid>
          <Grid item>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              {receiver.firstName} {receiver.lastName}
            </Typography>
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          <Grid item>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              {transactionDetails?.amount &&
                formatAmount(parseInt(transactionDetails.amount, 10) * 100)}
            </Typography>
          </Grid>
          <Grid item>for</Grid>
          <Grid item>{transactionDetails?.description}</Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TransactionCreateStepThree;
