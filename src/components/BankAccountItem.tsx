import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { BankAccount } from "../models";
import { ListItemText } from "@material-ui/core";

export interface BankAccountListItemProps {
  bankAccount: BankAccount;
}

const BankAccountListItem: React.FC<BankAccountListItemProps> = ({
  bankAccount
}) => {
  return (
    <ListItem data-test={`bankaccount-list-item-${bankAccount.id}`}>
      <ListItemText primary={`${bankAccount.bankName}`} />
    </ListItem>
  );
};

export default BankAccountListItem;
