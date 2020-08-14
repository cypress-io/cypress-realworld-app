import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";
import { Button, Grid } from "@material-ui/core";
import { BankAccountPayload, User } from "../models";
import { useHistory } from "react-router";

const validationSchema = object({
  bankName: string().min(5, "Must contain at least 5 characters").required("Enter a bank name"),
  routingNumber: string()
    .length(9, "Must contain a valid routing number")
    .required("Enter a valid bank routing number"),
  accountNumber: string()
    .length(9, "Must contain a valid account number")
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
  const [didSubmit, setDidSubmit] = useState(false);
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
      onSubmit={(values, { setSubmitting }) => {
        setDidSubmit(true);
        // setSubmitting(true);

        // createBankAccount({ ...values, userId });

        // if (!onboarding) {
        //   history.push("/bankaccounts");
        // }
      }}
    >
      {({ isValid, isSubmitting }) => (
        <Form className={classes.form} data-test="bankaccount-form" tabIndex={0}>
          <Field name="bankName">
            {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
              <TextField
                variant="outlined"
                margin="dense"
                fullWidth
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
              <div
                color="primary"
                className={classes.submit}
                data-test="bankaccount-submit"
                onClick={() => setDidSubmit(true)}
              >
                Save
              </div>

              {didSubmit ? <div data-test="submit-worked">Submit worked</div> : <div></div>}

              <div style={{ height: 700 }}></div>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default BankAccountForm;
