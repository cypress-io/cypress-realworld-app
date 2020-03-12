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
import { contactsTransactionsMachine } from "../machines/contactsTransactionsMachine";

export interface TransactionContactListProps {
  filterComponent: ReactNode;
  dateRangeFilters: TransactionDateRangePayload;
  amountRangeFilters: TransactionAmountRangePayload;
}

const TransactionContactsList: React.FC<TransactionContactListProps> = ({
  filterComponent,
  dateRangeFilters,
  amountRangeFilters
}) => {
  const [current, send] = useMachine(contactsTransactionsMachine, {
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
        header="Contacts"
        transactions={results as TransactionResponseItem[]}
        isLoading={current.matches("loading")}
        loadNextPage={loadNextPage}
        pagination={pageData as TransactionPagination}
      />
    </>
  );
};

export default TransactionContactsList;
