import React from "react";
import { format as formatDate } from "date-fns";
import { Popover, Chip, useTheme, makeStyles } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import CancelIcon from "@material-ui/icons/Cancel";
import indigo from "@material-ui/core/colors/indigo";
import InfiniteCalendar, { Calendar, withRange } from "react-infinite-calendar";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "react-infinite-calendar/styles.css";
import {
  TransactionDateRangePayload,
  TransactionQueryPayload
} from "../models";
import {
  hasDateQueryFields,
  getDateQueryFields
} from "../utils/transactionUtils";

const CalendarWithRange = withRange(Calendar);

export type TransactionListDateRangeFilterProps = {
  filterTransactions: Function;
  transactionFilters: TransactionQueryPayload;
  clearTransactionFilters: Function;
};

const useStyles = makeStyles(theme => ({
  popover: {
    [theme.breakpoints.down("sm")]: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }
  }
}));

const TransactionListDateRangeFilter: React.FC<TransactionListDateRangeFilterProps> = ({
  filterTransactions,
  transactionFilters,
  clearTransactionFilters
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryHasDateFields =
    transactionFilters && hasDateQueryFields(transactionFilters);

  const [
    dateRangeAnchorEl,
    setDateRangeAnchorEl
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

  const dateRangeOpen = Boolean(dateRangeAnchorEl);
  const dateRangeId = dateRangeOpen ? "date-range-popover" : undefined;

  const formatButtonDate = (date: string) => {
    return formatDate(new Date(date), "MMM, D YYYY");
  };

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
    <div>
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
        className={classes.popover}
      >
        <InfiniteCalendar
          width={isMobile ? window.innerWidth : 350}
          height={isMobile ? window.innerHeight : 300}
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
    </div>
  );
};

export default TransactionListDateRangeFilter;
