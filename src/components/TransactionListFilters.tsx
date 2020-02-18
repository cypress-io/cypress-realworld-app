import React, { useState } from "react";
import { format } from "date-fns";
import { makeStyles, Paper, Grid, Button, Popover } from "@material-ui/core";
import InfiniteCalendar, { Calendar, withRange } from "react-infinite-calendar";
import "react-infinite-calendar/styles.css";

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
  }
}));

export interface StateProps {}

export interface DispatchProps {}

export type TransactionListFiltersProps = StateProps & DispatchProps;

type SelectedDates = {
  start?: string;
  end?: string;
};

const selectedDatesDefault: SelectedDates = {
  start: undefined,
  end: undefined
};

const TransactionListFilters: React.FC<TransactionListFiltersProps> = ({}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [selectedDates, setSelectedDates] = useState(selectedDatesDefault);

  const onCalendarSelect = (e: { eventType: number; start: any; end: any }) => {
    if (e.eventType === 3) {
      setSelectedDates({ start: e.start, end: e.end });
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
    <Paper className={classes.paper}>
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
            color="primary"
            onClick={handleClick}
          >
            Time Range{" "}
            {selectedDates.start && selectedDates.end
              ? `${formatButtonDate(selectedDates.start)} - 
              ${formatButtonDate(selectedDates.end)} `
              : "All"}
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
              width={400}
              height={300}
              Component={CalendarWithRange}
              selected={false}
              onSelect={onCalendarSelect}
              locale={{
                headerFormat: "MMM Do"
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
