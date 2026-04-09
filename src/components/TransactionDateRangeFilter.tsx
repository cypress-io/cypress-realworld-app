import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { format as formatDate } from "date-fns";
import { Popover, Chip, useTheme, Drawer, Button, useMediaQuery, colors } from "@mui/material";
import { ArrowDropDown as ArrowDropDownIcon, Cancel as CancelIcon } from "@mui/icons-material";
import Calendar from "react-calendar";

import "react-calendar/dist/Calendar.css";
import { TransactionDateRangePayload, Value, ValuePiece } from "../models";
import { hasDateQueryFields, localDateToUTCISOString } from "../utils/transactionUtils";

const PREFIX = "TransactionListDateRangeFilter";

const classes = {
  popover: `${PREFIX}-popover`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.popover}`]: {
    [theme.breakpoints.down("md")]: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  },
}));

const { indigo } = colors;

export type TransactionListDateRangeFilterProps = {
  filterDateRange: Function;
  dateRangeFilters: TransactionDateRangePayload;
  resetDateRange: Function;
};

const TransactionListDateRangeFilter: React.FC<TransactionListDateRangeFilterProps> = ({
  filterDateRange,
  dateRangeFilters,
  resetDateRange,
}) => {
  const theme = useTheme();
  const xsBreakpoint = useMediaQuery(theme.breakpoints.only("xs"));
  const queryHasDateFields = dateRangeFilters && hasDateQueryFields(dateRangeFilters);
  const [calendarValue, setCalendarValue] = useState<Value>(null);

  const [dateRangeAnchorEl, setDateRangeAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const onCalendarSelect = (val: Value) => {
    if (val && !(val instanceof Date)) {
      const [rangeStart, rangeEnd] = val;
      const calValue = {
        dateRangeStart: localDateToUTCISOString(rangeStart),
        dateRangeEnd: localDateToUTCISOString(rangeEnd),
      };
      setCalendarValue(val);
      filterDateRange(calValue);
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

  const formatButtonDate = (date: Date) => {
    return formatDate(date, "MMM, d yyyy");
  };

  const dateRangeLabel = (dateRangeFields: Value) => {
    if (dateRangeFields && !(dateRangeFields instanceof Date)) {
      const [dateRangeStart, dateRangeEnd] = dateRangeFields;
      const label = `${formatButtonDate(dateRangeStart!)} - ${formatButtonDate(dateRangeEnd!)}`;
      return label;
    }
  };

  return (
    <Root>
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
          data-test="transaction-list-filter-date-range-button"
          label={`Date: ${dateRangeLabel(calendarValue)}`}
          deleteIcon={<CancelIcon data-test="transaction-list-filter-date-clear-button" />}
          onDelete={() => {
            setCalendarValue(null);
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
          <RangeCalendar
            onCalendarSelect={onCalendarSelect}
            xsBreakpoint={xsBreakpoint}
            color={indigo}
            dataTest="transaction-list-filter-date-range"
            defaultValue={calendarValue}
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
          <RangeCalendar
            onCalendarSelect={onCalendarSelect}
            xsBreakpoint={xsBreakpoint}
            color={indigo}
            dataTest="transaction-list-filter-date-range"
            defaultValue={calendarValue}
          />
        </Drawer>
      )}
    </Root>
  );
};

export function RangeCalendar({
  onCalendarSelect,
  xsBreakpoint,
  color,
  dataTest,
  defaultValue,
}: {
  onCalendarSelect: (value: Value) => void;
  xsBreakpoint: boolean;
  color: Record<string, string>;
  dataTest: string;
  defaultValue: Value;
}) {
  const [value, setValue] = useState<Value>(defaultValue);

  const width = xsBreakpoint ? window.innerWidth : 350;
  const height = xsBreakpoint ? window.innerHeight : 300;

  const handleChange = (val: Value, _: any) => {
    setValue(val);
    onCalendarSelect(val);
  };

  return (
    <div
      data-test={dataTest}
      style={{
        width,
        maxWidth: "100%",
        background: color["400"],
        padding: 8,
        borderRadius: 8,
      }}
    >
      <Calendar onChange={handleChange} value={value} selectRange={true} />
    </div>
  );
}

export default TransactionListDateRangeFilter;
