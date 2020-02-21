import React from "react";
import { format as formatDate } from "date-fns";
import {
  makeStyles,
  Paper,
  Grid,
  Button,
  Popover,
  Typography,
  Slider,
  Chip
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import indigo from "@material-ui/core/colors/indigo";
import InfiniteCalendar, { Calendar, withRange } from "react-infinite-calendar";
import "react-infinite-calendar/styles.css";
import { TransactionDateRangePayload } from "../models";
import {
  formatAmount,
  hasDateQueryFields,
  getDateQueryFields
} from "../utils/transactionUtils";

const CalendarWithRange = withRange(Calendar);

const useStyles = makeStyles(theme => ({
  amountRangeRoot: {
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
  },
  dateRangeLabel: {
    marginRight: theme.spacing(2)
  },
  dateRangeButton: {
    backgroundColor: "#F7FAFC",
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: "#EDF2F7"
    }
  },
  clearFiltersButton: {
    backgroundColor: "#F7FAFC",
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: "#EDF2F7"
    }
  }
}));

export type TransactionListFiltersProps = {
  filterTransactions: Function;
  transactionFilters: TransactionDateRangePayload;
  clearTransactionFilters: Function;
};

type SelectedDates = {
  start?: string;
  end?: string;
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
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const onCalendarSelect = (e: { eventType: number; start: any; end: any }) => {
    if (e.eventType === 3) {
      filterTransactions({
        dateRangeStart: new Date(e.start.setUTCHours(0, 0, 0, 0)).toISOString(),
        dateRangeEnd: new Date(e.end.setUTCHours(23, 59, 59, 999)).toISOString()
      });
      setAnchorEl(null);
    }
  };

  const handleDateRangeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setAnchorEl(null);
  };

  function amountRangeValueText(value: number) {
    return formatAmount(value);
  }

  const handleAmountRangeChange = (event: any, newValue: number | number[]) => {
    setAmountRangeValue(newValue as number[]);
  };
  const dateRangeOpen = Boolean(anchorEl);
  const dateRangeId = dateRangeOpen ? "simple-popover" : undefined;

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
        justify="space-between"
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
              data-test="transaction-list-filter-date-range-button"
              label={`${dateRangeLabel(transactionFilters)}`}
              onDelete={() => {
                clearTransactionFilters({ filterType: "date" });
              }}
            />
          )}
          <Popover
            id={dateRangeId}
            open={dateRangeOpen}
            anchorEl={anchorEl}
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
          <div className={classes.amountRangeRoot}>
            <Typography id="range-slider" gutterBottom>
              Amount Range
            </Typography>
            <Slider
              value={amountRangeValue}
              onChange={handleAmountRangeChange}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              getAriaValueText={amountRangeValueText}
            />
          </div>
        </Grid>
        <Grid item></Grid>
      </Grid>
    </Paper>
  );
};

export default TransactionListFilters;
