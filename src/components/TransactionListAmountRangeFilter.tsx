import React from "react";
import {
  Grid,
  Popover,
  Typography,
  Slider,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import { ArrowDropDown as ArrowDropDownIcon } from "@mui/icons-material";
import { TransactionAmountRangePayload } from "../models";
import {
  formatAmountRangeValues,
  amountRangeValueText,
  amountRangeValueTextLabel,
  padAmountWithZeros,
  //hasAmountQueryFields
} from "../utils/transactionUtils";
import { first, last } from "lodash/fp";

export type TransactionListAmountRangeFilterProps = {
  filterAmountRange: Function;
  amountRangeFilters: TransactionAmountRangePayload;
  resetAmountRange: Function;
};

const TransactionListAmountRangeFilter: React.FC<TransactionListAmountRangeFilterProps> = ({
  filterAmountRange,
  amountRangeFilters,
  resetAmountRange,
}) => {
  const theme = useTheme();
  const xsBreakpoint = useMediaQuery(theme.breakpoints.only("xs"));

  const initialAmountRange = [0, 100];
  const [amountRangeValue, setAmountRangeValue] = React.useState<number[]>(initialAmountRange);

  const [amountRangeAnchorEl, setAmountRangeAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const handleAmountRangeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAmountRangeAnchorEl(event.currentTarget);
  };

  const handleAmountRangeClose = () => {
    setAmountRangeAnchorEl(null);
  };

  const handleAmountRangeChange = (_event: any, amountRange: number | number[]) => {
    filterAmountRange({
      amountMin: padAmountWithZeros(first(amountRange as number[]) as number),
      amountMax: padAmountWithZeros(last(amountRange as number[]) as number),
    });
    setAmountRangeValue(amountRange as number[]);
  };

  const amountRangeOpen = Boolean(amountRangeAnchorEl);
  const amountRangeId = amountRangeOpen ? "amount-range-popover" : undefined;

  const AmountRangeFilter = () => (
    <Grid
      data-test="transaction-list-filter-amount-range"
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={1}
      sx={{ width: "300px", margin: "30px" }}
    >
      <Grid item>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: "100%" }}
        >
          <Grid item sx={{ width: "225px" }}>
            <Typography color="textSecondary" data-test="transaction-list-filter-amount-range-text">
              Amount Range: {formatAmountRangeValues(amountRangeValue)}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              data-test="transaction-list-filter-amount-clear-button"
              onClick={() => {
                setAmountRangeValue(initialAmountRange);
                resetAmountRange();
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
          sx={{ width: "200px" }}
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
  );

  return (
    <div>
      <Chip
        color="primary"
        variant="outlined"
        onClick={handleAmountRangeClick}
        data-test="transaction-list-filter-amount-range-button"
        label={`Amount: ${formatAmountRangeValues(amountRangeValue)}`}
        deleteIcon={<ArrowDropDownIcon />}
        onDelete={handleAmountRangeClick}
      />
      {!xsBreakpoint && (
        <Popover
          id={amountRangeId}
          open={amountRangeOpen}
          anchorEl={amountRangeAnchorEl}
          onClose={handleAmountRangeClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <AmountRangeFilter />
        </Popover>
      )}
      {xsBreakpoint && (
        <Drawer
          id={amountRangeId}
          open={amountRangeOpen}
          ModalProps={{ onClose: handleAmountRangeClose }}
          anchor="bottom"
          data-test="amount-range-filter-drawer"
        >
          <Button
            data-test="amount-range-filter-drawer-close"
            onClick={() => handleAmountRangeClose()}
          >
            Close
          </Button>
          <AmountRangeFilter />
        </Drawer>
      )}
    </div>
  );
};

export default TransactionListAmountRangeFilter;
