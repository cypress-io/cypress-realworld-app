import React from "react";
import { format as formatDate } from "date-fns";
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
import CancelIcon from "@material-ui/icons/Cancel";
import indigo from "@material-ui/core/colors/indigo";
import InfiniteCalendar, { Calendar, withRange } from "react-infinite-calendar";
import "react-infinite-calendar/styles.css";
import { TransactionDateRangePayload } from "../models";
import {
  hasDateQueryFields,
  getDateQueryFields,
  formatAmountRangeValues,
  amountRangeValueText,
  amountRangeValueTextLabel
} from "../utils/transactionUtils";

const CalendarWithRange = withRange(Calendar);

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
  },
  calendar: {
    width: theme.spacing(2),
    height: theme.spacing(4)
  }
}));

export type TransactionListFiltersProps = {
  filterTransactions: Function;
  transactionFilters: TransactionDateRangePayload;
  clearTransactionFilters: Function;
};

const TransactionListFilters: React.FC<TransactionListFiltersProps> = ({
  filterTransactions,
  transactionFilters,
  clearTransactionFilters
}) => {
  const classes = useStyles();
  const [amountRangeValue, setAmountRangeValue] = React.useState<number[]>([
    0,
    1000
  ]);
  const [
    dateRangeAnchorEl,
    setDateRangeAnchorEl
  ] = React.useState<HTMLDivElement | null>(null);
  const [
    amountRangeAnchorEl,
    setAmountRangeAnchorEl
  ] = React.useState<HTMLDivElement | null>(null);

  const onCalendarSelect = (e: { eventType: number; start: any; end: any }) => {
    if (e.eventType === 3) {
      filterTransactions({
        dateRangeStart: new Date(e.start.setUTCHours(0, 0, 0, 0)).toISOString(),
        dateRangeEnd: new Date(e.end.setUTCHours(23, 59, 59, 999)).toISOString()
      });
      setDateRangeAnchorEl(null);
    }
  };

  const handleDateRangeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setDateRangeAnchorEl(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setDateRangeAnchorEl(null);
  };

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
    setAmountRangeValue(amountRange as number[]);
  };

  const dateRangeOpen = Boolean(dateRangeAnchorEl);
  const dateRangeId = dateRangeOpen ? "date-range-popover" : undefined;
  const amountRangeOpen = Boolean(amountRangeAnchorEl);
  const amountRangeId = amountRangeOpen ? "amount-range-popover" : undefined;

  const formatButtonDate = (date: string) => {
    return formatDate(new Date(date), "MMM, D YYYY");
  };

  const queryHasDateFields =
    transactionFilters && hasDateQueryFields(transactionFilters);

  const dateRangeLabel = (transactionFilters: TransactionDateRangePayload) => {
    if (queryHasDateFields) {
      const { dateRangeStart, dateRangeEnd } = getDateQueryFields(
        transactionFilters
      );
      return `${formatButtonDate(dateRangeStart!)} - ${formatButtonDate(
        dateRangeEnd!
      )}`;
    }
    return "";
  };

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
          {!queryHasDateFields && (
            <Chip
              color="primary"
              variant="outlined"
              onClick={handleDateRangeClick}
              data-test="transaction-list-filter-date-range-button"
              label={"Date Range: ALL"}
              deleteIcon={<ArrowDropDownIcon />}
              onDelete={handleDateRangeClick}
            />
          )}
          {queryHasDateFields && (
            <Chip
              color="primary"
              variant="outlined"
              onClick={handleDateRangeClick}
              label={`Date Range: ${dateRangeLabel(transactionFilters)}`}
              deleteIcon={
                <CancelIcon data-test="transaction-list-filter-date-clear-button" />
              }
              onDelete={() => {
                clearTransactionFilters({ filterType: "date" });
              }}
            />
          )}
          <Popover
            id={dateRangeId}
            open={dateRangeOpen}
            anchorEl={dateRangeAnchorEl}
            onClose={handleDateRangeClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left"
            }}
          >
            <InfiniteCalendar
              width={window.innerWidth <= 350 ? window.innerWidth : 350}
              height={300}
              rowHeight={50}
              Component={CalendarWithRange}
              selected={false}
              onSelect={onCalendarSelect}
              locale={{
                headerFormat: "MMM Do"
              }}
              theme={{
                accentColor: indigo["400"],
                headerColor: indigo["500"],
                weekdayColor: indigo["300"],
                selectionColor: indigo["300"],
                floatingNav: {
                  background: indigo["400"],
                  color: "#FFF",
                  chevron: "#FFA726"
                }
              }}
            />
          </Popover>
        </Grid>
        <Grid item>
          <Chip
            color="primary"
            variant="outlined"
            onClick={handleAmountRangeClick}
            data-test="transaction-list-filter-amount-range-button"
            label={"Amount Range: ALL"}
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
                    <Typography color="textSecondary">
                      Amount Range: {formatAmountRangeValues(amountRangeValue)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button>Clear</Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Slider
                  className={classes.amountRangeSlider}
                  value={amountRangeValue}
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
