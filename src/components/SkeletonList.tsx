import React from "react";
import { Skeleton } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: "95%",
  },
}));

const ListSkeleton = () => {
  const classes = useStyles();
  return (
    <div className={classes.root} data-test="list-skeleton">
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
      <br />
      <br />
      <Skeleton />
      <Skeleton animation={false} />
      <Skeleton animation="wave" />
    </div>
  );
};

export default ListSkeleton;
