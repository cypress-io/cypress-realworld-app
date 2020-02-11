import React from "react";

import ListItem from "@material-ui/core/ListItem";
import { BankAccount } from "../models";
import { Grid, Typography, Button } from "@material-ui/core";

export interface BankAccountListItemProps {
  bankAccount: BankAccount;
  deleteBankAccount: Function;
}

const BankAccountListItem: React.FC<BankAccountListItemProps> = ({
  bankAccount,
  deleteBankAccount
}) => {
  return (
    <ListItem data-test={`bankaccount-list-item-${bankAccount.id}`}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Grid item>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            {bankAccount.bankName}{" "}
            {bankAccount.isDeleted ? "(Deleted)" : undefined}
          </Typography>
        </Grid>
        {!bankAccount.isDeleted && (
          <Grid item>
            <Button
              color="primary"
              size="large"
              data-test="bankaccount-list-item-delete"
              onClick={() => {
                deleteBankAccount({ id: bankAccount.id });
              }}
            >
              Delete
            </Button>
          </Grid>
        )}
      </Grid>
    </ListItem>
  );
};

export default BankAccountListItem;
