import React from "react";

import BankAccountItem from "./BankAccountItem";
import List from "@material-ui/core/List";
import { BankAccount } from "../models";

export interface BankAccountListProps {
  bankAccounts: BankAccount[];
  deleteBankAccount: Function;
}

const BankAccountList: React.FC<BankAccountListProps> = ({
  bankAccounts,
  deleteBankAccount
}) => {
  return (
    <List data-test="bankaccount-list">
      {bankAccounts &&
        bankAccounts.map((bankAccount: BankAccount) => (
          <BankAccountItem
            key={bankAccount.id}
            bankAccount={bankAccount}
            deleteBankAccount={deleteBankAccount}
          />
        ))}
    </List>
  );
};

export default BankAccountList;
