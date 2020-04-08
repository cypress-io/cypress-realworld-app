import React from "react";
import Typography from "@material-ui/core/Typography";

export default function Footer() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Built by "}
      <a
        style={{ textDecoration: "none" }}
        target="_blank"
        rel="noopener noreferrer"
        href="https://cypress.io"
      >
        Cypress.io
      </a>
      {"."}
    </Typography>
  );
}
