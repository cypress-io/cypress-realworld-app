import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: 18
  },
  titleName: {
    fontSize: 18,
    color: "#1A202C"
  }
}));

const TransactionTitle: React.FC<{
  senderName: string;
  receiverName: string;
  status: string;
}> = ({ senderName, receiverName }) => {
  const classes = useStyles();

  return (
    <Typography color="textSecondary" className={classes.title} gutterBottom>
      <Typography
        className={classes.titleName}
        display="inline"
        component="span"
      >
        {senderName}
      </Typography>
      {status}
      <Typography
        className={classes.titleName}
        display="inline"
        component="span"
      >
        {receiverName}
      </Typography>
    </Typography>
  );
};

export default TransactionTitle;
