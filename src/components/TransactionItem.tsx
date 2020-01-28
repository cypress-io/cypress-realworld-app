import React from "react";
import {
  Card,
  CardActions,
  CardContent,
  ListItem,
  Button,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TransactionResponseItem } from "../models";
import CommentForm from "./CommentForm";

const useStyles = makeStyles({
  card: {
    minWidth: "100%"
  },
  title: {
    fontSize: 14
  }
});

type TransactionProps = {
  transaction: TransactionResponseItem;
  transactionLike: Function;
  transactionComment: Function;
};

const TransactionItem: React.FC<TransactionProps> = ({
  transaction,
  transactionLike,
  transactionComment
}) => {
  const classes = useStyles();
  // Payment
  /*if (transaction.) {

  }

  // Request
  if (transaction.requestStatus === "pending") {

  }*/

  return (
    <ListItem data-test={`transaction-item-${transaction.id}`}>
      <Card className={classes.card}>
        <CardContent>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            {transaction.description}
          </Typography>
          <Typography
            variant="body2"
            component="p"
            data-test={`transaction-like-count-${transaction.id}`}
          >
            Likes: {transaction.likes ? transaction.likes.length : 0}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            color="primary"
            size="small"
            onClick={() => transactionLike({ transactionId: transaction.id })}
            data-test={`transaction-like-${transaction.id}`}
          >
            Like
          </Button>
          <CommentForm
            transactionId={transaction.id}
            transactionComment={payload => transactionComment(payload)}
          />
        </CardActions>
      </Card>
    </ListItem>
  );
};

export default TransactionItem;
