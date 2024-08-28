import React from "react";
import { Snackbar } from "@mui/material";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";
import { SnackbarContext, SnackbarSchema, SnackbarEvents } from "../machines/snackbarMachine";
import { useActor } from "@xstate/react";
import { Alert } from "@mui/material";

interface Props {
  snackbarService: Interpreter<
    SnackbarContext,
    SnackbarSchema,
    SnackbarEvents,
    any,
    ResolveTypegenMeta<TypegenDisabled, SnackbarEvents, BaseActionObject, ServiceMap>
  >;
}

const AlertBar: React.FC<Props> = ({ snackbarService }) => {
  const [snackbarState] = useActor(snackbarService);

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
