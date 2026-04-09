import React from "react";
import { Box, Typography, Grid, colors } from "@mui/material";

const { grey } = colors;

const EmptyList: React.FC<{ entity: string; children?: React.ReactNode }> = ({
  entity,
  children,
}) => {
  return (
    <Box
      display="flex"
      height={600}
      min-height={600}
      alignItems="center"
      justifyContent="center"
      border={1}
      borderColor={grey[200]}
    >
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ height: "100%", width: "100%" }}
        spacing={2}
      >
        <Grid item data-test="empty-list-header">
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            No {entity}
          </Typography>
        </Grid>
        <Grid item>
          <Box
            data-test="empty-list-children"
            display="flex"
            width={300}
            alignItems="center"
            justifyContent="center"
          >
            {children}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmptyList;
