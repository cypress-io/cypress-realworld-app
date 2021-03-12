import React from "react";
import { format as formatDate } from "date-fns";
import {
  Popover,
  Chip,
  useTheme,
  makeStyles,
  Drawer,
  Button,
  useMediaQuery,
  colors,
} from "@material-ui/core";
import { ArrowDropDown as ArrowDropDownIcon, Cancel as CancelIcon } from "@material-ui/icons";
import InfiniteCalendar, { Calendar, withRange } from "react-infinite-calendar";

import "react-infinite-calendar/styles.css";
import { TransactionDateRangePayload } from "../models";
import { hasDateQueryFields } from "../utils/transactionUtils";

const { indigo } = colors;
const CalendarWithRange = withRange(Calendar);

export type TransactionListDateRangeFilterProps = {
  filterDateRange: Function;
  dateRangeFilters: TransactionDateRangePayload;
  resetDateRange: Function;
};

const useStyles = makeStyles((theme) => ({
  popover: {
    [theme.breakpoints.down("sm")]: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  },
}));

const TransactionListDateRangeFilter: React.FC<TransactionListDateRangeFilterProps> = ({
  filterDateRange,
  dateRangeFilters,
  resetDateRange,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const xsBreakpoint = useMediaQuery(theme.breakpoints.only("xs"));
  const queryHasDateFields = dateRangeFilters && hasDateQueryFields(dateRangeFilters);

  const [dateRangeAnchorEl, setDateRangeAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const onCalendarSelect = (e: { eventType: number; start: any; end: any }) => {
    if (e.eventType === 3) {
      filterDateRange({
        dateRangeStart: new Date(e.start.setUTCHours(0, 0, 0, 0)).toISOString(),
        dateRangeEnd: new Date(e.end.setUTCHours(23, 59, 59, 999)).toISOString(),
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

  const dateRangeOpen = Boolean(dateRangeAnchorEl);
  const dateRangeId = dateRangeOpen ? "date-range-popover" : undefined;

  const formatButtonDate = (date: string) => {
    return formatDate(new Date(date), "MMM, d yyyy");
  };

  const dateRangeLabel = (dateRangeFields: TransactionDateRangePayload) => {
    const { dateRangeStart, dateRangeEnd } = dateRangeFields;
    return `${formatButtonDate(dateRangeStart!)} - ${formatButtonDate(dateRangeEnd!)}`;
  };

  return (
    <div>
      {!queryHasDateFields && (
        <Chip
          color="primary"
          variant="outlined"
          onClick={handleDateRangeClick}
          data-test="transaction-list-filter-date-range-button"
          label={"Date: ALL"}
          deleteIcon={<ArrowDropDownIcon />}
          onDelete={handleDateRangeClick}
        />
      )}
      {queryHasDateFields && (
        <Chip
          color="primary"
          variant="outlined"
          onClick={handleDateRangeClick}
          label={`Date: ${dateRangeLabel(dateRangeFilters)}`}
          deleteIcon={<CancelIcon data-test="transaction-list-filter-date-clear-button" />}
          onDelete={() => {
            resetDateRange();
          }}
        />
      )}
      {!xsBreakpoint && (
        <Popover
          id={dateRangeId}
          open={dateRangeOpen}
          anchorEl={dateRangeAnchorEl}
          onClose={handleDateRangeClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          className={classes.popover}
        >
          <InfiniteCalendar
            data-test="transaction-list-filter-date-range"
            width={xsBreakpoint ? window.innerWidth : 350}
            height={xsBreakpoint ? window.innerHeight : 300}
            rowHeight={50}
            Component={CalendarWithRange}
            selected={false}
            onSelect={onCalendarSelect}
            locale={{
              headerFormat: "MMM Do",
            }}
            theme={{
              accentColor: indigo["400"],
              headerColor: indigo["500"],
              weekdayColor: indigo["300"],
              selectionColor: indigo["300"],
              floatingNav: {
                background: indigo["400"],
                color: "#FFF",
                chevron: "#FFA726",
              },
            }}
          />
        </Popover>
      )}
      {xsBreakpoint && (
        <Drawer
          id={dateRangeId}
          open={dateRangeOpen}
          ModalProps={{ onClose: handleDateRangeClose }}
          anchor="bottom"
          data-test="date-range-filter-drawer"
        >
          <Button data-test="date-range-filter-drawer-close" onClick={() => handleDateRangeClose()}>
            Close
          </Button>
          <InfiniteCalendar
            data-test="transaction-list-filter-date-range"
            width={window.innerWidth}
            height={window.innerHeight - 185}
            rowHeight={50}
            Component={CalendarWithRange}
            selected={false}
            onSelect={onCalendarSelect}
            locale={{
              headerFormat: "MMM Do",
            }}
            theme={{
              accentColor: indigo["400"],
              headerColor: indigo["500"],
              weekdayColor: indigo["300"],
              selectionColor: indigo["300"],
              floatingNav: {
                background: indigo["400"],
                color: "#FFF",
                chevron: "#FFA726",
              },
            }}
          />
        </Drawer>
      )}
    </div>
  );
};

export default TransactionListDateRangeFilter;
