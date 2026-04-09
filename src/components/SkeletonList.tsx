import React from "react";
import { styled } from "@mui/material/styles";
import { Skeleton } from "@mui/material";
const PREFIX = "ListSkeleton";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    minHeight: "100vh",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: "95%",
  },
}));

const ListSkeleton = () => {
  return (
    <Root className={classes.root} data-test="list-skeleton">
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
    </Root>
  );
};

export default ListSkeleton;
