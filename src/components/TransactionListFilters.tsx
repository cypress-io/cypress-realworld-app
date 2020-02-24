import React from "react";
import { makeStyles, Paper, Grid } from "@material-ui/core";
import { TransactionQueryPayload } from "../models";
import TransactionListDateRangeFilter from "./TransactionDateRangeFilter";
import TransactionListAmountRangeFilter from "./TransactionListAmountRangeFilter";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

export type TransactionListFiltersProps = {
  filterTransactions: Function;
  transactionFilters: TransactionQueryPayload;
  clearTransactionFilters: Function;
};

const TransactionListFilters: React.FC<TransactionListFiltersProps> = ({
  filterTransactions,
  transactionFilters,
  clearTransactionFilters
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper} elevation={0}>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid item>
          <TransactionListDateRangeFilter
            filterTransactions={filterTransactions}
            transactionFilters={transactionFilters}
            clearTransactionFilters={clearTransactionFilters}
          />
        </Grid>
        <Grid item>
          <TransactionListAmountRangeFilter
            filterTransactions={filterTransactions}
            transactionFilters={transactionFilters}
            clearTransactionFilters={clearTransactionFilters}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TransactionListFilters;
