import React from "react";
import clsx from "clsx";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import HomeIcon from "@material-ui/icons/Home";
import PersonIcon from "@material-ui/icons/Person";
import LogoutIcon from "@material-ui/icons/ExitToApp";
import NotificationsIcon from "@material-ui/icons/Notifications";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import { User } from "../models";
import { Grid, Avatar, Typography } from "@material-ui/core";
import { formatAmount } from "../utils/transactionUtils";
import { head } from "lodash/fp";

const drawerWidth = 240;

export const mainListItems = (
  handleDrawerClose:
    | ((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void)
    | undefined
) => (
  <div>
    <ListItem
      button
      onClick={handleDrawerClose}
      component={RouterLink}
      to="/"
      data-test="sidenav-home"
    >
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>
    <ListItem
      button
      onClick={handleDrawerClose}
      component={RouterLink}
      to="/user/settings"
      data-test="sidenav-user-settings"
    >
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText primary="My Account" />
    </ListItem>
    <ListItem
      button
      onClick={handleDrawerClose}
      component={RouterLink}
      to="/bankaccounts"
      data-test="sidenav-bankaccounts"
    >
      <ListItemIcon>
        <AccountBalanceIcon />
      </ListItemIcon>
      <ListItemText primary="Bank Accounts" />
    </ListItem>
    <ListItem
      button
      onClick={handleDrawerClose}
      component={RouterLink}
      to="/notifications"
      data-test="sidenav-notifications"
    >
      <ListItemIcon>
        <NotificationsIcon />
      </ListItemIcon>
      <ListItemText primary="Notifications" />
    </ListItem>
  </div>
);

export const secondaryListItems = (signOutPending: Function) => (
  <div>
    <ListItem button>
      <ListItemIcon>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText
        primary="Logout"
        data-test="sidenav-signout"
        onClick={() => signOutPending()}
      />
    </ListItem>
  </div>
);

const useStyles = makeStyles(theme => ({
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    marginTop: 50,
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9)
    }
  },
  userProfile: {
    padding: theme.spacing(2)
  },
  userProfileHidden: {
    display: "none"
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  accountBalance: {
    marginLeft: theme.spacing(2)
  },
  amount: {
    fontWeight: "bold"
  },
  accountBalanceHidden: {
    display: "none"
  }
}));

interface Props {
  signOutPending: () => void;
  handleDrawerClose: () => void;
  drawerOpen: boolean;
  currentUser?: User;
}

const NavDrawer: React.FC<Props> = ({
  signOutPending,
  handleDrawerClose,
  drawerOpen,
  currentUser
}) => {
  const classes = useStyles();

  return (
    <Drawer
      variant="temporary"
      classes={{
        paper: clsx(
          classes.drawerPaper,
          !drawerOpen && classes.drawerPaperClose
        )
      }}
      open={drawerOpen}
    >
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        className={drawerOpen ? classes.userProfile : classes.userProfileHidden}
      >
        {currentUser && (
          <>
            <Grid item>
              <Avatar
                className={classes.avatar}
                alt={`${currentUser.firstName} ${currentUser.lastName}`}
                src={currentUser.avatar}
              />
            </Grid>
            <Grid item>
              <Typography variant="subtitle1" color="textPrimary">
                {currentUser.firstName} {head(currentUser.lastName)}
              </Typography>
              <Typography variant="subtitle2" color="inherit" gutterBottom>
                @{currentUser.username}
              </Typography>
            </Grid>
          </>
        )}
        <Grid item>
          <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose} data-test="sidenav-close">
              <ChevronLeftIcon />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      {currentUser && (
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          className={
            drawerOpen ? classes.userProfile : classes.userProfileHidden
          }
        >
          <Grid item>
            <Typography
              variant="h6"
              color="textPrimary"
              className={classes.amount}
              data-test="sidenav-user-balance"
            >
              {currentUser.balance && formatAmount(currentUser.balance)}
            </Typography>
            <Typography variant="subtitle2" color="inherit" gutterBottom>
              Account Balance
            </Typography>
          </Grid>
        </Grid>
      )}
      <Divider />
      <List>{mainListItems(handleDrawerClose)}</List>
      <Divider />
      <List>{secondaryListItems(signOutPending)}</List>
    </Drawer>
  );
};

export default NavDrawer;
