import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import {
  TransactionPagination,
  TransactionResponseItem,
  TransactionQueryPayload
} from "../models";
import MainContainer from "../containers/MainContainer";
import TransactionNavTabs from "./TransactionNavTabs";
import TransactionListFilters from "./TransactionListFilters";
import TransactionList from "./TransactionList";
import { contactsTransactionsMachine } from "../machines/contactsTransactionsMachine";

export interface TransactionContactListProps {
  filterContactTransactions: Function;
  clearTransactionFilters: Function;
  transactionFilters: TransactionQueryPayload;
}

const TransactionContactsList: React.FC<TransactionContactListProps> = ({
  filterContactTransactions,
  transactionFilters,
  clearTransactionFilters
}) => {
  const [current, send] = useMachine(contactsTransactionsMachine, {
    devTools: true
  });
  const { pageData, results } = current.context;

  useEffect(() => {
    send("FETCH");
  }, [send]);

  const loadNextPage = (page: number) => send("FETCH", { page });

  return (
    <MainContainer>
      <TransactionNavTabs />
      <TransactionListFilters
        transactionFilters={transactionFilters}
        filterTransactions={filterContactTransactions}
        clearTransactionFilters={clearTransactionFilters}
      />
      <br />
      <TransactionList
        header="Contacts"
        transactions={results as TransactionResponseItem[]}
        isLoading={current.matches("loading")}
        loadNextPage={loadNextPage}
        infinite={true}
        pagination={pageData as TransactionPagination}
      />
    </MainContainer>
  );
};

export default TransactionContactsList;
