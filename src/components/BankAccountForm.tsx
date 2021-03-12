import React from "react";
import { makeStyles, TextField, Button, Grid } from "@material-ui/core";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";
import { BankAccountPayload, User } from "../models";
import { useHistory } from "react-router";

const validationSchema = object({
  bankName: string().min(5, "Must contain at least 5 characters").required("Enter a bank name"),
  routingNumber: string()
    .length(9, "Must contain a valid routing number")
    .required("Enter a valid bank routing number"),
  accountNumber: string()
    .min(9, "Must contain at least 9 digits")
    .max(12, "Must contain no more than 12 digits")
    .required("Enter a valid bank account number"),
});

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export interface BankAccountFormProps {
  userId: User["id"];
  createBankAccount: Function;
  onboarding?: boolean;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  userId,
  createBankAccount,
  onboarding,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const initialValues: BankAccountPayload = {
    userId,
    bankName: "",
    accountNumber: "",
    routingNumber: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);

        createBankAccount({ ...values, userId });

        if (!onboarding) {
          history.push("/bankaccounts");
        }
      }}
    >
      {({ isValid, isSubmitting }) => (
        <Form className={classes.form} data-test="bankaccount-form">
          <Field name="bankName">
            {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
              <TextField
                variant="outlined"
                margin="dense"
                fullWidth
                required
                id={"bankaccount-bankName-input"}
                type="text"
                placeholder="Bank Name"
                data-test={"bankaccount-bankName-input"}
                error={(touched || value !== initialValue) && Boolean(error)}
                helperText={touched || value !== initialValue ? error : ""}
                {...field}
              />
            )}
          </Field>
          <Field name="routingNumber">
            {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
              <TextField
                variant="outlined"
                margin="dense"
                fullWidth
                required
                id={"bankaccount-routingNumber-input"}
                type="text"
                placeholder="Routing Number"
                data-test={"bankaccount-routingNumber-input"}
                error={(touched || value !== initialValue) && Boolean(error)}
                helperText={touched || value !== initialValue ? error : ""}
                {...field}
              />
            )}
          </Field>
          <Field name="accountNumber">
            {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
              <TextField
                variant="outlined"
                margin="dense"
                fullWidth
                required
                id={"bankaccount-accountNumber-input"}
                type="text"
                placeholder="Account Number"
                data-test={"bankaccount-accountNumber-input"}
                error={(touched || value !== initialValue) && Boolean(error)}
                helperText={touched || value !== initialValue ? error : ""}
                {...field}
              />
            )}
          </Field>
          <Grid container spacing={2} direction="row" justify="flex-start" alignItems="flex-start">
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
