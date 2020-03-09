import React, { useEffect } from "react";
import {
  TransactionPagination,
  TransactionResponseItem,
  TransactionQueryPayload
} from "../models";
import MainContainer from "../containers/MainContainer";
import TransactionNavTabs from "./TransactionNavTabs";
import TransactionListFilters from "./TransactionListFilters";
import TransactionList from "./TransactionList";
import { isEmpty } from "lodash/fp";

export interface TransactionContactListProps {
  filterContactTransactions: Function;
  clearTransactionFilters: Function;
  isLoadingTransactions: Boolean;
  contactsPagination: TransactionPagination;
  contactsTransactions: TransactionResponseItem[];
  transactionFilters: TransactionQueryPayload;
}

const TransactionContactsList: React.FC<TransactionContactListProps> = ({
  isLoadingTransactions,
  contactsTransactions,
  contactsPagination,
  filterContactTransactions,
  transactionFilters,
  clearTransactionFilters
}) => {
  useEffect(() => {
    if (isEmpty(contactsTransactions)) {
      filterContactTransactions();
    }
  }, [contactsTransactions]);

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
        transactions={contactsTransactions}
        isLoading={isLoadingTransactions}
        loadNextPage={filterContactTransactions}
        infinite={true}
        pagination={contactsPagination}
      />
    </MainContainer>
  );
};

export default TransactionContactsList;
