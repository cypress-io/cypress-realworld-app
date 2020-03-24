import React from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";
import { Button, Grid } from "@material-ui/core";
import { BankAccountPayload, User } from "../models";
import { useHistory } from "react-router";

const validationSchema = object({
  bankName: string(),
  accountNumber: string(),
  routingNumber: string()
});

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

export interface BankAccountFormProps {
  userId: User["id"];
  createBankAccount: Function;
  onboarding?: boolean;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  userId,
  createBankAccount,
  onboarding
}) => {
  const history = useHistory();
  const classes = useStyles();
  const initialValues: BankAccountPayload = {
    userId,
    bankName: "",
    accountNumber: "",
    routingNumber: ""
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);

        createBankAccount({ userId, ...values });

        if (!onboarding) {
          history.push("/bankaccounts");
        }
      }}
    >
      {({ isValid, isSubmitting }) => (
        <Form className={classes.form} data-test="bankaccount-form">
          <Field name="bankName">
            {({ field, meta }: FieldProps) => (
              <TextField
                variant="outlined"
                margin="dense"
                fullWidth
                required
                id={"bankaccount-bankName-input"}
                type="text"
                placeholder="Bank Name"
                data-test={"bankaccount-bankName-input"}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched ? meta.error : ""}
                {...field}
              />
            )}
          </Field>
          <Field name="accountNumber">
            {({ field, meta }: FieldProps) => (
              <TextField
                variant="outlined"
                margin="dense"
                fullWidth
                required
                id={"bankaccount-accountNumber-input"}
                type="text"
                placeholder="Account Number"
                data-test={"bankaccount-accountNumber-input"}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched ? meta.error : ""}
                {...field}
              />
            )}
          </Field>
          <Field name="routingNumber">
            {({ field, meta }: FieldProps) => (
              <TextField
                variant="outlined"
                margin="dense"
                fullWidth
                required
                id={"bankaccount-routingNumber-input"}
                type="text"
                placeholder="Routing Number"
                data-test={"bankaccount-routingNumber-input"}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched ? meta.error : ""}
                {...field}
              />
            )}
          </Field>
          <Grid
            container
            spacing={2}
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                data-test="bankaccount-submit"
                disabled={!isValid || isSubmitting}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default BankAccountForm;
