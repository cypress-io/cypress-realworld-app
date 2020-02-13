import React from "react";
import {
  Button,
  Typography,
  Grid,
  Avatar,
  Paper,
  IconButton
} from "@material-ui/core";
import LikeIcon from "@material-ui/icons/ThumbUpAltOutlined";
import CommentIcon from "@material-ui/icons/CommentRounded";
import { makeStyles } from "@material-ui/core/styles";
import {
  TransactionResponseItem,
  TransactionRequestStatus,
  User
} from "../models";
import CommentForm from "./CommentForm";
import {
  isPendingRequestTransaction,
  receiverIsCurrentUser,
  isRequestTransaction,
  formatAmount,
  isAcceptedRequestTransaction,
  currentUserLikesTransaction
} from "../utils/transactionUtils";
import { random } from "lodash/fp";

const imgNumber = random(3, 50);
const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
  paperComments: {
    marginTop: theme.spacing(6),
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
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
    marginTop: theme.spacing(4)
  },
  listitem: {
    listStyleType: "none"
  },
  avatarLarge: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  }
}));

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

  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Transaction Detail
      </Typography>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        data-test={`transaction-item-${transaction.id}`}
      >
        <Grid item className={classes.headline}>
          <Avatar
            className={classes.avatarLarge}
            src={`https://i.pravatar.cc/300?img=${imgNumber}`}
          />
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item></Grid>
            <Grid item>{headline}</Grid>
            <Grid item>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {transaction.description}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Amount transaction={transaction} />
        </Grid>
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
            alignItems="center"
            spacing={1}
          >
            <Grid item>
              {transaction.likes ? transaction.likes.length : 0}{" "}
            </Grid>
            <Grid item>
              <IconButton
                color="primary"
                disabled={currentUserLikesTransaction(currentUser, transaction)}
                onClick={() =>
                  transactionLike({ transactionId: transaction.id })
                }
                data-test={`transaction-like-button-${transaction.id}`}
              >
                <LikeIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item>
            <CommentForm
              transactionId={transaction.id}
              transactionComment={payload => transactionComment(payload)}
            />
          </Grid>
          {receiverIsCurrentUser(currentUser, transaction) &&
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
      </Grid>
      {transaction.comments && (
        <Paper className={classes.paperComments}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            <CommentIcon /> Comments
          </Typography>
        </Paper>
      )}
    </Paper>
  );

  /* 
  return (

    <Card data-test={`transaction-item-${transaction.id}`}>
      <List>
        <ListItem className={classes.listitem}>
          <ListItemAvatar>
            <Avatar
              className={classes.avatarLarge}
              src={`https://i.pravatar.cc/300?img=${imgNumber}`}
            />
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
                        transactionComment={payload =>
                          transactionComment(payload)
                        }
                      />
                    </Grid>
                    {receiverIsCurrentUser(currentUser, transaction) &&
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
                </Grid>
              </Grid>
            </Grid>
          </ListItemText>
          <ListItemSecondaryAction>
            <Amount transaction={transaction} />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </Card>
  );
  */
};

export default TransactionDetail;
