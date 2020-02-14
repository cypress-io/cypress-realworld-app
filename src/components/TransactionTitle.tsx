import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: 18
  }
}));

const TransactionTitle: React.FC<{ children: any }> = ({ children }) => {
  const classes = useStyles();

  return (
    <Typography color="textSecondary" className={classes.title} gutterBottom>
      {children}
    </Typography>
  );
};

export default TransactionTitle;
