import React from "react";
import {
  ListItem,
  Button,
  Typography,
  Grid,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import LikeIcon from "@material-ui/icons/ThumbUpAltOutlined";
import CommentIcon from "@material-ui/icons/CommentRounded";
import { makeStyles } from "@material-ui/core/styles";
import { TransactionResponseItem } from "../models";
import { useHistory } from "react-router";
import TransactionTitle from "./TransactionTitle";
import TransactionAmount from "./TransactionAmount";

const useStyles = makeStyles(theme => ({
  card: {
    minWidth: "100%"
  },
  avatar: {
    width: theme.spacing(2)
  },
  headline: {
    padding: "0"
  },
  actionsRow: {
    marginTop: 2,
    [theme.breakpoints.up("sm")]: {
      marginTop: 5
    }
  },
  socialStats: {
    [theme.breakpoints.up("sm")]: {
      marginTop: 2
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles();
  const history = useHistory();

  const showTransactionDetail = (transactionId: string) => {
    history.push(`/transaction/${transactionId}`);
  };

  return (
    <ListItem
      data-test={`transaction-item-${transaction.id}`}
      alignItems="flex-start"
    >
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
          <Grid item>
            <TransactionTitle transaction={transaction} />
          </Grid>
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
            className={classes.actionsRow}
          >
            <Grid item>
              <Grid
                container
                direction="row"
                justify="center"
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
            <Grid item>
              <Button
                className={classes.viewTransactionButton}
                color="primary"
                size="small"
                onClick={() => showTransactionDetail(transaction.id)}
                data-test={`transaction-view-${transaction.id}`}
              >
                Details
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </ListItemText>
      <ListItemSecondaryAction>
        <TransactionAmount transaction={transaction} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default TransactionItem;
