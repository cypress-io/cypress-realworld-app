import React from "react";
import {
  makeStyles,
  Paper,
  Grid,
  Popover,
  Typography,
  Slider,
  Chip,
  Button
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { TransactionQueryPayload } from "../models";
import {
  formatAmountRangeValues,
  amountRangeValueText,
  amountRangeValueTextLabel,
  padAmountWithZeros,
  hasAmountQueryFields,
  getAmountQueryFields
} from "../utils/transactionUtils";
import { first, last } from "lodash/fp";
import TransactionListDateRangeFilter from "./TransactionDateRangeFilter";

const useStyles = makeStyles(theme => ({
  amountRangeRoot: {
    width: 300,
    margin: 30
  },
  amountRangeTitleRow: {
    width: "100%"
  },
  amountRangeTitle: {
    width: 225
  },
  amountRangeSlider: {
    width: 200
  },
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
  const queryHasAmountFields =
    transactionFilters && hasAmountQueryFields(transactionFilters);

  const amountRangeValues = (transactionFilters: TransactionQueryPayload) => {
    if (queryHasAmountFields) {
      const { amountMin, amountMax } = getAmountQueryFields(transactionFilters);
      return [amountMin, amountMax] as number[];
    }
    return [0, 100] as number[];
  };

  const [amountRangeValue, setAmountRangeValue] = React.useState<number[]>([
    0,
    100
  ]);

  const [
    amountRangeAnchorEl,
    setAmountRangeAnchorEl
  ] = React.useState<HTMLDivElement | null>(null);

  const handleAmountRangeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAmountRangeAnchorEl(event.currentTarget);
  };

  const handleAmountRangeClose = () => {
    setAmountRangeAnchorEl(null);
  };

  const handleAmountRangeChange = (
    _event: any,
    amountRange: number | number[]
  ) => {
    filterTransactions({
      amountMin: padAmountWithZeros(first(amountRange as number[]) as number),
      amountMax: padAmountWithZeros(last(amountRange as number[]) as number)
    });
    setAmountRangeValue(amountRange as number[]);
  };

  const amountRangeOpen = Boolean(amountRangeAnchorEl);
  const amountRangeId = amountRangeOpen ? "amount-range-popover" : undefined;

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
          <Chip
            color="primary"
            variant="outlined"
            onClick={handleAmountRangeClick}
            data-test="transaction-list-filter-amount-range-button"
            label={`Amount Range: ${formatAmountRangeValues(amountRangeValue)}`}
            deleteIcon={<ArrowDropDownIcon />}
            onDelete={handleAmountRangeClick}
          />
          <Popover
            id={amountRangeId}
            open={amountRangeOpen}
            anchorEl={amountRangeAnchorEl}
            onClose={handleAmountRangeClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left"
            }}
          >
            <Grid
              container
              direction="column"
              justify="flex-start"
              alignItems="flex-start"
              spacing={1}
              className={classes.amountRangeRoot}
            >
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                  className={classes.amountRangeTitleRow}
                >
                  <Grid item className={classes.amountRangeTitle}>
                    <Typography
                      color="textSecondary"
                      data-test="transaction-list-filter-amount-range-text"
                    >
                      Amount Range: {formatAmountRangeValues(amountRangeValue)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      data-test="transaction-list-filter-amount-clear-button"
                      onClick={() => {
                        clearTransactionFilters({ filterType: "amount" });
                      }}
                    >
                      Clear
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Slider
                  data-test="transaction-list-filter-amount-range-slider"
                  className={classes.amountRangeSlider}
                  value={amountRangeValue}
                  min={0}
                  max={100}
                  onChange={handleAmountRangeChange}
                  valueLabelDisplay="auto"
                  aria-labelledby="range-slider"
                  getAriaValueText={amountRangeValueText}
                  valueLabelFormat={amountRangeValueTextLabel}
                />
              </Grid>
            </Grid>
          </Popover>
        </Grid>
        <Grid item></Grid>
      </Grid>
    </Paper>
  );
};

export default TransactionListFilters;
