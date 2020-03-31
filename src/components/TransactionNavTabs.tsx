import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Link, useRouteMatch } from "react-router-dom";
import { useTheme } from "@material-ui/core";

export default function TransactionNavTabs() {
  const match = useRouteMatch();
  const theme = useTheme();

  // Route Lookup for tabs
  const navUrls: any = {
    "/": 0,
    "/public": 0,
    "/contacts": 1,
    "/personal": 2,
  };

  // Set selected tab based on url
  const [value, setValue] = React.useState(navUrls[match.url]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Tabs
      value={value}
      onChange={handleChange}
      indicatorColor={theme.palette.common.white}
      centered
      data-test="nav-transaction-tabs"
    >
      <Tab
        label="Everyone"
        component={Link}
        to="/"
        data-test="nav-public-tab"
      />
      <Tab
        label="Friends"
        component={Link}
        to="/contacts"
        data-test="nav-contacts-tab"
      />
      <Tab
        label="Mine"
        component={Link}
        to="/personal"
        data-test="nav-personal-tab"
      />
    </Tabs>
  );
}
