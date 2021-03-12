import React from "react";
import { useHistory } from "react-router";
import {
  ListItem,
  Typography,
  Grid,
  Avatar,
  ListItemAvatar,
  Paper,
  Badge,
  withStyles,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { ThumbUpAltOutlined as LikeIcon, CommentRounded as CommentIcon } from "@material-ui/icons";
import { TransactionResponseItem } from "../models";
import TransactionTitle from "./TransactionTitle";
import TransactionAmount from "./TransactionAmount";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(0),
    margin: "auto",
    width: "100%",
  },
  avatar: {
    width: theme.spacing(2),
  },
  socialStats: {
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2),
    },
  },
  countIcons: {
    color: theme.palette.grey[400],
  },
  countText: {
    color: theme.palette.grey[400],
    marginTop: 2,
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
}));

type TransactionProps = {
  transaction: TransactionResponseItem;
};

const SmallAvatar = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 22,
      height: 22,
      border: `2px solid ${theme.palette.background.paper}`,
    },
  })
)(Avatar);

const TransactionItem: React.FC<TransactionProps> = ({ transaction }) => {
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
              <Badge
                overlap="circle"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                badgeContent={<SmallAvatar src={transaction.receiverAvatar} />}
              >
                <Avatar src={transaction.senderAvatar} />
              </Badge>
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
                    <Typography data-test="transaction-like-count" className={classes.countText}>
                      {transaction.likes.length}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <CommentIcon className={classes.countIcons} />
                  </Grid>
                  <Grid item>
                    <Typography data-test="transaction-comment-count" className={classes.countText}>
                      {transaction.comments.length}
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
