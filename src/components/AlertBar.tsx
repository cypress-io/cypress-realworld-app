import React from "react";
import { Snackbar } from "@material-ui/core";
import { Interpreter } from "xstate";
import { SnackbarContext, SnackbarSchema, SnackbarEvents } from "../machines/snackbarMachine";
import { useService } from "@xstate/react";
import { Alert } from "@material-ui/lab";

interface Props {
  snackbarService: Interpreter<SnackbarContext, SnackbarSchema, SnackbarEvents, any>;
}

const AlertBar: React.FC<Props> = ({ snackbarService }) => {
  const [snackbarState] = useService(snackbarService);

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={snackbarState?.matches("visible")}
      autoHideDuration={3000}
    >
      <Alert
        data-test={`alert-bar-${snackbarState?.context.severity}`}
        elevation={6}
        variant="filled"
        severity={snackbarState?.context.severity}
      >
        {snackbarState?.context.message}
      </Alert>
    </Snackbar>
  );
};

export default AlertBar;
