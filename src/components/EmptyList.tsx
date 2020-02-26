import React from "react";
import { Box, Typography, Grid } from "@material-ui/core";
import grey from "@material-ui/core/colors/grey";

const EmptyList: React.FC<{ entity: string; children?: React.ReactNode }> = ({
  entity,
  children
}) => {
  return (
    <Box
      display="flex"
      min-height={200}
      height={200}
      alignItems="center"
      justifyContent="center"
      border={1}
      borderColor={grey[200]}
    >
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item data-test="empty-list-header">
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            No {entity}
          </Typography>
        </Grid>
        <Grid item>
          <Box
            data-test="empty-list-children"
            display="flex"
            height={50}
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
