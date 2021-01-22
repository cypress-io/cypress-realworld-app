import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import { TransactionResponseItem } from "../models";
import { isRequestTransaction, isAcceptedRequestTransaction } from "../utils/transactionUtils";

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: 18,
    [theme.breakpoints.down("sm")]: {
      fontSize: theme.typography.fontSize,
    },
  },
  titleAction: {
    fontSize: 18,
    [theme.breakpoints.down("sm")]: {
      fontSize: theme.typography.fontSize,
    },
  },
  titleName: {
    fontSize: 18,
    [theme.breakpoints.down("sm")]: {
      fontSize: theme.typography.fontSize,
    },
    color: "#1A202C",
  },
}));

const TransactionTitle: React.FC<{
  transaction: TransactionResponseItem;
}> = ({ transaction }) => {
  const classes = useStyles();

  return (
    <Typography color="textSecondary" className={classes.title} gutterBottom>
      <Typography
        data-test={`transaction-sender-${transaction.id}`}
        className={classes.titleName}
        display="inline"
        component="span"
      >
        {transaction.senderName}
      </Typography>
      <Typography
        data-test={`transaction-action-${transaction.id}`}
        display="inline"
        className={classes.titleAction}
        component="span"
      >
        {isRequestTransaction(transaction)
          ? isAcceptedRequestTransaction(transaction)
            ? " charged "
            : " requested "
          : " paid "}
      </Typography>
      <Typography
        data-test={`transaction-receiver-${transaction.id}`}
        className={classes.titleName}
        display="inline"
        component="span"
      >
        {transaction.receiverName}
      </Typography>
    </Typography>
  );
};

export default TransactionTitle;
