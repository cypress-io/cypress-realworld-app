import React, { useEffect, ReactNode } from "react";
import { useMachine } from "@xstate/react";
import {
  TransactionPagination,
  TransactionResponseItem,
  TransactionDateRangePayload,
  TransactionAmountRangePayload,
} from "../models";
import TransactionNavTabs from "./TransactionNavTabs";
import TransactionList from "./TransactionList";
import { personalTransactionsMachine } from "../machines/personalTransactionsMachine";

export interface TransactionPersonalListProps {
  filterComponent: ReactNode;
  dateRangeFilters: TransactionDateRangePayload;
  amountRangeFilters: TransactionAmountRangePayload;
}

const TransactionPersonalList: React.FC<TransactionPersonalListProps> = ({
  filterComponent,
  dateRangeFilters,
  amountRangeFilters,
}) => {
  const [current, send] = useMachine(personalTransactionsMachine, {
    devTools: true,
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
        header="Personal"
        transactions={results as TransactionResponseItem[]}
        isLoading={current.matches("loading")}
        loadNextPage={loadNextPage}
        pagination={pageData as TransactionPagination}
        showCreateButton={true}
      />
    </>
  );
};

export default TransactionPersonalList;
