import * as React from "react";
import { mount } from "@cypress/react";
import { addDays, format as formatDate, startOfDay } from "date-fns";
import TransactionDateRangeFilter from "./TransactionDateRangeFilter";
import { endOfDayUTC } from "../utils/transactionUtils";

describe("Transaction Date Range Filter", () => {
  it("should default to ALL", () => {
    const filterDateRangeSpy = cy.spy();
    const resetDateRangeSpy = cy.spy();

    mount(
      <TransactionDateRangeFilter
        filterDateRange={filterDateRangeSpy}
        dateRangeFilters={{}}
        resetDateRange={resetDateRangeSpy}
      />
    );
    cy.get("[data-test='transaction-list-filter-date-range-button']").should("contain", "ALL");
  });

  it("should render a defined date range filter", () => {
    const filterDateRangeSpy = cy.spy();
    const resetDateRangeSpy = cy.spy();
    const dateRangeFilters = {
      dateRangeStart: new Date("Jan 01 2018").toISOString(),
      dateRangeEnd: new Date("Dec 05 2030").toISOString(),
    };

    mount(
      <TransactionDateRangeFilter
        filterDateRange={filterDateRangeSpy}
        dateRangeFilters={dateRangeFilters}
        resetDateRange={resetDateRangeSpy}
      />
    );
    cy.get("[data-test='transaction-list-filter-date-range-button']")
      .should("contain", formatDate(new Date(dateRangeFilters.dateRangeStart), "MMM, d yyyy"))
      .and("contain", formatDate(new Date(dateRangeFilters.dateRangeEnd), "MMM, d yyyy"));
  });

  it("should set a date range filter", () => {
    const filterDateRangeSpy = cy.spy();
    const resetDateRangeSpy = cy.spy();
    const dateRangeStart = startOfDay(new Date(2014, 1, 1));
    const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

    mount(
      <TransactionDateRangeFilter
        filterDateRange={filterDateRangeSpy}
        dateRangeFilters={{}}
        resetDateRange={resetDateRangeSpy}
      />
    );

    // @ts-ignore
    cy.pickDateRange(dateRangeStart, dateRangeEnd);
  });
});
