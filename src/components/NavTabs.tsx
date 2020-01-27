import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    flexGrow: 1
  }
});

export default function NavTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab
          label="Public"
          component={Link}
          to="/"
          data-test="nav-public-tab"
        />
        <Tab
          label="Contacts"
          component={Link}
          to="/contacts"
          data-test="nav-contacts-tab"
        />
        <Tab
          label="Personal"
          component={Link}
          to="/personal"
          data-test="nav-personal-tab"
        />
      </Tabs>
    </Paper>
  );
}
