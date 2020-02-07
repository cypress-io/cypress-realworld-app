import React from "react";
import {
  Card,
  CardActions,
  CardContent,
  ListItem,
  Button,
  Typography,
  Grid
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  TransactionResponseItem,
  TransactionRequestStatus,
  User
} from "../models";
import CommentForm from "./CommentForm";
import { useHistory } from "react-router";
import {
  isPendingRequestTransaction,
  senderIsCurrentUser
} from "../utils/transactionUtils";

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
  transactionUpdate: Function;
  currentUser: User;
};

const TransactionDetail: React.FC<TransactionProps> = ({
  transaction,
  transactionLike,
  transactionComment,
  transactionUpdate,
  currentUser
}) => {
  const classes = useStyles();
  const history = useHistory();
  // Payment
  /*if (transaction.) {

  }

  // Request
  if (transaction.requestStatus === "pending") {

  }*/

  const showTransactionDetail = (transactionId: string) => {
    history.push(`/transaction/${transactionId}`);
  };

  return (
    <ListItem
      data-test={`transaction-item-${transaction.id}`}
      onClick={() => showTransactionDetail(transaction.id)}
    >
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
          <Typography
            variant="body2"
            component="p"
            data-test={`transaction-comment-count-${transaction.id}`}
          >
            Comments: {transaction.comments ? transaction.comments.length : 0}
          </Typography>
        </CardContent>
        <CardActions>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Button
                color="primary"
                size="large"
                onClick={() =>
                  transactionLike({ transactionId: transaction.id })
                }
                data-test={`transaction-like-button-${transaction.id}`}
              >
                Like
              </Button>
            </Grid>
            <Grid item>
              <CommentForm
                transactionId={transaction.id}
                transactionComment={payload => transactionComment(payload)}
              />
            </Grid>
            {senderIsCurrentUser(currentUser, transaction) &&
              isPendingRequestTransaction(transaction) && (
                <Grid item>
                  <Button
                    color="primary"
                    size="small"
                    onClick={() =>
                      transactionUpdate({
                        id: transaction.id,
                        requestStatus: TransactionRequestStatus.accepted
                      })
                    }
                    data-test={`transaction-accept-request-${transaction.id}`}
                  >
                    Accept Request
                  </Button>
                  <Button
                    color="primary"
                    size="small"
                    onClick={() =>
                      transactionUpdate({
                        id: transaction.id,
                        requestStatus: TransactionRequestStatus.rejected
                      })
                    }
                    data-test={`transaction-reject-request-${transaction.id}`}
                  >
                    Reject Request
                  </Button>
                </Grid>
              )}
          </Grid>
        </CardActions>
      </Card>
    </ListItem>
  );
};

export default TransactionDetail;
