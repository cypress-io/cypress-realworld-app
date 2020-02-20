import React, { useState } from "react";
import { format } from "date-fns";
import { makeStyles, Paper, Grid, Button, Popover } from "@material-ui/core";
import indigo from "@material-ui/core/colors/indigo";
import InfiniteCalendar, { Calendar, withRange } from "react-infinite-calendar";
import "react-infinite-calendar/styles.css";
import { TransactionQueryPayload } from "../models";

const CalendarWithRange = withRange(Calendar);

const useStyles = makeStyles(theme => ({
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
  }
}));

export type TransactionListFiltersProps = {
  filterTransactions: Function;
  transactionFilters: TransactionQueryPayload;
};

type SelectedDates = {
  start?: string;
  end?: string;
};

const selectedDatesDefault: SelectedDates = {
  start: undefined,
  end: undefined
};

const TransactionListFilters: React.FC<TransactionListFiltersProps> = ({
  filterTransactions,
  transactionFilters
}) => {
  const { dateRangeStart, dateRangeEnd } = transactionFilters;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const onCalendarSelect = (e: { eventType: number; start: any; end: any }) => {
    if (e.eventType === 3) {
      filterTransactions({
        dateRangeStart: e.start.toString(),
        dateRangeEnd: e.end.toString()
      });
      setAnchorEl(null);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const formatButtonDate = (date: string) => {
    return format(new Date(date), "MMM, D YYYY");
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
          <Button
            aria-describedby={id}
            variant="contained"
            className={classes.dateRangeButton}
            onClick={handleClick}
          >
            <span className={classes.dateRangeLabel}>Date Range:</span>
            <b>
              {dateRangeStart && dateRangeEnd
                ? `${formatButtonDate(dateRangeStart)} -
              ${formatButtonDate(dateRangeEnd)}`
                : "ALL"}
            </b>
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
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
                  background: "green",
                  color: "#FFF",
                  chevron: "#FFA726"
                }
              }}
            />
          </Popover>
        </Grid>
        <Grid item></Grid>
      </Grid>
    </Paper>
  );
};

export default TransactionListFilters;
