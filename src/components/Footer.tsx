import React from "react";
import { Container, Typography } from "@material-ui/core";

import CypressLogo from "../components/SvgCypressLogo";

export default function Footer() {
  return (
    <Container maxWidth="sm" style={{ marginTop: 50 }}>
      <Typography variant="body2" color="textSecondary" align="center">
        Built by
        <a
          style={{ textDecoration: "none" }}
          target="_blank"
          rel="noopener noreferrer"
          href="https://cypress.io"
        >
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
