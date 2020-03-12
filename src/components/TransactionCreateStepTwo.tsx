import React, { useState } from "react";
import NumberFormat from "react-number-format";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object, number } from "yup";
import { Paper, Typography, Button, Grid, Container } from "@material-ui/core";
import { User } from "../models";

const validationSchema = object({
  amount: number().required("Amount is required"),
  description: string().required("Please type a note"),
  senderId: string(),
  receiverId: string()
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

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { value: string } }) => void;
}

function NumberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            ...other,
            value: values.value
          }
        });
      }}
      thousandSeparator
      isNumericString
      prefix="$"
    />
  );
}

export interface TransactionCreateStepTwoProps {
  receiver: User;
  sender: User;
  transactionCreate: (payload: object) => void;
  showSnackbar: Function;
}

interface FormValues {
  amount: number | "";
  description: string;
  senderId: string;
  receiverId: string;
}

const TransactionCreateStepTwo: React.FC<TransactionCreateStepTwoProps> = ({
  receiver,
  sender,
  transactionCreate,
  showSnackbar
}) => {
  const classes = useStyles();
  const [transactionType, setTransactionType] = useState();
  const initialValues: FormValues = {
    amount: "",
    description: "",
    senderId: sender.id,
    receiverId: receiver.id
  };

  return (
    <Paper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        <b>TO:</b> {receiver.firstName} {receiver.lastName}
        {transactionType}
      </Typography>
      <Container maxWidth="xs">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnMount={true}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true);

            transactionCreate({ type: transactionType, ...values });
            showSnackbar({
              severity: "success",
              message: "Transaction Submitted!"
            });

            // reset transactionType
            setTransactionType(undefined);

            setSubmitting(false);
          }}
        >
          {({ isValid, isSubmitting }) => (
            <Form className={classes.form} data-test="transaction-create-form">
              <Field name="amount">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                    autoFocus
                    id={"transaction-create-amount-input"}
                    type="text"
                    placeholder="Amount"
                    data-test={"transaction-create-amount-input"}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched ? meta.error : ""}
                    InputProps={{
                      inputComponent: NumberFormatCustom as any,
                      inputProps: { id: "amount" }
                    }}
                    {...field}
                  />
                )}
              </Field>
              <Field name="description">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                    id={"transaction-create-description-input"}
                    type="text"
                    placeholder="Add a note"
                    data-test={"transaction-create-description-input"}
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
                justify="center"
                alignItems="center"
              >
                <Grid item>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    data-test="transaction-create-submit-request"
                    disabled={!isValid || isSubmitting}
                    onClick={() => setTransactionType("request")}
                  >
                    Request
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    data-test="transaction-create-submit-payment"
                    disabled={!isValid || isSubmitting}
                    onClick={() => setTransactionType("payment")}
                  >
                    Pay
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Container>
    </Paper>
  );
};

export default TransactionCreateStepTwo;
