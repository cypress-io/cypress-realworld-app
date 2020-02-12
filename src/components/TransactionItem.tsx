import React from "react";
import {
  ListItem,
  Button,
  Typography,
  Grid,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from "@material-ui/core";
import LikeIcon from "@material-ui/icons/ThumbUpAltOutlined";
import CommentIcon from "@material-ui/icons/CommentRounded";
import { makeStyles } from "@material-ui/core/styles";
import { TransactionResponseItem } from "../models";
import { useHistory } from "react-router";
import {
  isRequestTransaction,
  formatAmount,
  isAcceptedRequestTransaction
} from "../utils/transactionUtils";

const useStyles = makeStyles(theme => ({
  card: {
    minWidth: "100%"
  },
  title: {
    fontSize: 18
  },
  titleName: {
    fontSize: 18,
    color: "#1A202C"
  },
  amountPositive: {
    fontSize: 24,
    color: "#4CAF50"
  },
  amountNegative: {
    fontSize: 24,
    color: "red"
  },
  avatar: {
    width: theme.spacing(2)
  },
  headline: {
    padding: "0"
  }
}));

type TransactionProps = {
  transaction: TransactionResponseItem;
  transactionIndex: number;
};

const TransactionItem: React.FC<TransactionProps> = ({
  transaction,
  transactionIndex
}) => {
  const classes = useStyles();
  const history = useHistory();

  const TitleName: React.FC<{ name: string }> = ({ name }) => (
    <Typography className={classes.titleName} display="inline" component="span">
      {name}
    </Typography>
  );

  const Amount: React.FC<{ transaction: TransactionResponseItem }> = ({
    transaction
  }) => (
    <Typography
      className={
        isRequestTransaction(transaction)
          ? classes.amountPositive
          : classes.amountNegative
      }
      display="inline"
      component="span"
      color="primary"
    >
      {isRequestTransaction(transaction) ? "+" : "-"}
      {transaction.amount && formatAmount(transaction.amount)}
    </Typography>
  );

  const Title: React.FC<{ children: any }> = ({ children }) => (
    <Typography color="textSecondary" className={classes.title} gutterBottom>
      {children}
    </Typography>
  );

  const headline = isRequestTransaction(transaction) ? (
    <Title>
      <TitleName name={transaction.senderName} />
      {isAcceptedRequestTransaction(transaction) ? " charged " : " requested "}
      <TitleName name={transaction.receiverName} />
    </Title>
  ) : (
    <Title>
      <TitleName name={transaction.senderName} /> paid{" "}
      <TitleName name={transaction.receiverName} />
    </Title>
  );

  const showTransactionDetail = (transactionId: string) => {
    history.push(`/transaction/${transactionId}`);
  };

  return (
    <ListItem data-test={`transaction-item-${transaction.id}`}>
      <ListItemAvatar>
        <Avatar src={`https://i.pravatar.cc/100?img=${transactionIndex}`} />
      </ListItemAvatar>
      <ListItemText className={classes.headline}>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="flex-start"
        >
          <Grid item>{headline}</Grid>
          <Grid item>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {transaction.description}
            </Typography>
          </Grid>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={1}
              >
                <Grid item>
                  {transaction.likes ? transaction.likes.length : 0}{" "}
                </Grid>
                <Grid item>
                  <LikeIcon />
                </Grid>
                <Grid item>
                  {transaction.comments ? transaction.comments.length : 0}{" "}
                </Grid>
                <Grid item>
                  <CommentIcon />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                size="small"
                onClick={() => showTransactionDetail(transaction.id)}
                data-test={`transaction-view-${transaction.id}`}
              >
                View Transaction
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </ListItemText>
      <ListItemSecondaryAction>
        <Amount transaction={transaction} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default TransactionItem;
