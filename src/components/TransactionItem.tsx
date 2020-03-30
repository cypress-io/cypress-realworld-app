import React from "react";
import {
  ListItem,
  Typography,
  Grid,
  Avatar,
  ListItemAvatar,
  Paper
} from "@material-ui/core";
import LikeIcon from "@material-ui/icons/ThumbUpAltOutlined";
import CommentIcon from "@material-ui/icons/CommentRounded";
import { makeStyles } from "@material-ui/core/styles";
import { TransactionResponseItem } from "../models";
import { useHistory } from "react-router";
import TransactionTitle from "./TransactionTitle";
import TransactionAmount from "./TransactionAmount";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(0),
    margin: "auto",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      maxWidth: 600
    }
  },
  avatar: {
    width: theme.spacing(2)
  },
  socialStats: {
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2)
    }
  },
  countIcons: {
    color: theme.palette.grey[400]
  },
  countText: {
    color: theme.palette.grey[400],
    marginTop: 2,
    height: theme.spacing(2),
    width: theme.spacing(2)
  },
  viewTransactionButton: {
    [theme.breakpoints.down("sm")]: {
      width: theme.spacing(1)
    }
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

  const showTransactionDetail = (transactionId: string) => {
    history.push(`/transaction/${transactionId}`);
  };

  return (
    <ListItem
      data-test={`transaction-item-${transaction.id}`}
      alignItems="flex-start"
      onClick={() => showTransactionDetail(transaction.id)}
    >
      <Paper className={classes.paper} elevation={0}>
        <Grid container spacing={2}>
          <Grid item>
            <ListItemAvatar>
              <Avatar
                src={`https://i.pravatar.cc/100?img=${transactionIndex}`}
              />
            </ListItemAvatar>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item xs>
                <TransactionTitle transaction={transaction} />
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {transaction.description}
                </Typography>
                <Grid
                  container
                  direction="row"
                  justify="flex-start"
                  alignItems="flex-start"
                  spacing={1}
                  className={classes.socialStats}
                >
                  <Grid item>
                    <LikeIcon className={classes.countIcons} />
                  </Grid>
                  <Grid item>
                    <Typography className={classes.countText}>
                      {transaction.likes ? transaction.likes.length : 0}{" "}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <CommentIcon className={classes.countIcons} />
                  </Grid>
                  <Grid item>
                    <Typography className={classes.countText}>
                      {transaction.comments ? transaction.comments.length : 0}{" "}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <TransactionAmount transaction={transaction} />
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </ListItem>
  );
};

export default TransactionItem;
