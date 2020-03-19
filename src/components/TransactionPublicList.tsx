import React, { useEffect, ReactNode } from "react";
import { useMachine } from "@xstate/react";
import {
  TransactionPagination,
  TransactionResponseItem,
  TransactionDateRangePayload,
  TransactionAmountRangePayload
} from "../models";
import TransactionNavTabs from "./TransactionNavTabs";
import TransactionList from "./TransactionList";
import { publicTransactionsMachine } from "../machines/publicTransactionsMachine";

export interface TransactionPublicListProps {
  filterComponent: ReactNode;
  dateRangeFilters: TransactionDateRangePayload;
  amountRangeFilters: TransactionAmountRangePayload;
}

const TransactionPublicList: React.FC<TransactionPublicListProps> = ({
  filterComponent,
  dateRangeFilters,
  amountRangeFilters
}) => {
  const [current, send] = useMachine(publicTransactionsMachine, {
    devTools: true
  });
  const { pageData, results } = current.context;

  useEffect(() => {
    send("FETCH", { ...dateRangeFilters, ...amountRangeFilters });
  }, [send, dateRangeFilters, amountRangeFilters]);

  const loadNextPage = (page: number) =>
    send("FETCH", { page, ...dateRangeFilters, ...amountRangeFilters });

  return (
    <>
      <TransactionNavTabs />
      {filterComponent}
      <br />
      <TransactionList
        header="Public"
        transactions={results as TransactionResponseItem[]}
        isLoading={current.matches("loading")}
        loadNextPage={loadNextPage}
        pagination={pageData as TransactionPagination}
      />
    </>
  );
};

export default TransactionPublicList;
