import React from "react";
import { List } from "@material-ui/core";

import { BankAccount } from "../models";
import BankAccountItem from "./BankAccountItem";
import EmptyList from "./EmptyList";

export interface BankAccountListProps {
  bankAccounts: BankAccount[];
  DeleteBankAccount: Function;
}

const BankAccountList: React.FC<BankAccountListProps> = ({ bankAccounts, DeleteBankAccount }) => {
  return (
    <>
      {bankAccounts?.length > 0 ? (
        <List data-test="bankaccount-list">
          {bankAccounts.map((bankAccount: BankAccount) => (
            <BankAccountItem
              key={bankAccount.id}
              bankAccount={bankAccount}
              DeleteBankAccount={DeleteBankAccount}
            />
          ))}
        </List>
      ) : (
        <EmptyList entity="Bank Accounts" />
      )}
    </>
  );
};

export default BankAccountList;
