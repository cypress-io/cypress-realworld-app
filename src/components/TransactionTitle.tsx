import React from "react";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { TransactionResponseItem } from "../models";
import { isRequestTransaction, isAcceptedRequestTransaction } from "../utils/transactionUtils";

const PREFIX = "TransactionTitle";

const classes = {
  title: `${PREFIX}-title`,
  titleAction: `${PREFIX}-titleAction`,
  titleName: `${PREFIX}-titleName`,
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  [`&.${classes.title}`]: {
    fontSize: 18,
    [theme.breakpoints.down("md")]: {
      fontSize: theme.typography.fontSize,
    },
  },

  [`& .${classes.titleAction}`]: {
    fontSize: 18,
    [theme.breakpoints.down("md")]: {
      fontSize: theme.typography.fontSize,
    },
  },

  [`& .${classes.titleName}`]: {
    fontSize: 18,
    [theme.breakpoints.down("md")]: {
      fontSize: theme.typography.fontSize,
    },
    color: "#1A202C",
  },
}));

const TransactionTitle: React.FC<{
  transaction: TransactionResponseItem;
}> = ({ transaction }) => {
  return (
    <StyledTypography color="textSecondary" className={classes.title} gutterBottom>
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
    </StyledTypography>
  );
};

export default TransactionTitle;
