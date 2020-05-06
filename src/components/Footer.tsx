import React from "react";
import Typography from "@material-ui/core/Typography";
import { ReactComponent as CypressLogo } from "../svgs/cypress-logo.svg";
import { Container } from "@material-ui/core";

export default function Footer() {
  return (
    <Container maxWidth="sm" style={{ marginTop: 50 }}>
      <Typography variant="body2" color="textSecondary" align="center">
        Built by
        <a style={{ textDecoration: "none" }} target="_blank" rel="noopener noreferrer" href="https://cypress.io">
          <CypressLogo
            style={{
              marginTop: -2,
              marginLeft: 5,
              height: "20px",
              width: "55px",
              verticalAlign: "middle",
            }}
          />
        </a>
      </Typography>
    </Container>
  );
}
