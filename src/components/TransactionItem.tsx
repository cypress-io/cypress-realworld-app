import React from "react";
import { styled } from "@mui/material/styles";
import { useHistory } from "react-router";
import {
  ListItem,
  Typography,
  Grid,
  Avatar,
  ListItemAvatar,
  Paper,
  Badge,
  Theme,
} from "@mui/material";
import { ThumbUpAltOutlined as LikeIcon, CommentRounded as CommentIcon } from "@mui/icons-material";
import { TransactionResponseItem } from "../models";
import TransactionTitle from "./TransactionTitle";
import TransactionAmount from "./TransactionAmount";

const PREFIX = "TransactionItem";

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
  avatar: `${PREFIX}-avatar`,
  socialStats: `${PREFIX}-socialStats`,
  countIcons: `${PREFIX}-countIcons`,
  countText: `${PREFIX}-countText`,
};

const StyledListItem = styled(ListItem)(({ theme }) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1,
  },

  [`& .${classes.paper}`]: {
    padding: theme.spacing(0),
    margin: "auto",
    width: "100%",
  },

  [`& .${classes.avatar}`]: {
    width: theme.spacing(2),
  },

  [`& .${classes.socialStats}`]: {
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(2),
    },
  },

  [`& .${classes.countIcons}`]: {
    color: theme.palette.grey[400],
  },

  [`& .${classes.countText}`]: {
    color: theme.palette.grey[400],
    marginTop: 2,
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
}));

type TransactionProps = {
  transaction: TransactionResponseItem;
};

const SmallAvatar = styled(Avatar)(({ theme }: { theme: Theme }) => {
  return {
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
  };
});

const TransactionItem: React.FC<TransactionProps> = ({ transaction }) => {
  const history = useHistory();

  const showTransactionDetail = (transactionId: string) => {
    history.push(`/transaction/${transactionId}`);
  };

  return (
    <StyledListItem
      data-test={`transaction-item-${transaction.id}`}
      alignItems="flex-start"
      onClick={() => showTransactionDetail(transaction.id)}
    >
      <Paper className={classes.paper} elevation={0}>
        <Grid container spacing={2}>
          <Grid item>
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                badgeContent={
                  <SmallAvatar
                    src={transaction.receiverAvatar}
                    classes={{
                      root: classes.root,
                    }}
                  />
                }
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
                  justifyContent="flex-start"
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
    </StyledListItem>
  );
};

export default TransactionItem;
