import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";
import MainContainer from "../containers/MainContainer";
import { Paper, Typography, Button, Grid, Container } from "@material-ui/core";
import { User } from "../models";

const validationSchema = object({
  amount: string().required("Amount is required"),
  description: string().required("Please type a note"),
  senderId: string(),
  receiverId: string(),
  type: string().oneOf(["payment", "request"])
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

export interface TransactionCreateStepTwoProps {
  receiver: User;
  sender: User;
  //transactionCreate: (payload: object) => void;
}

const TransactionCreateStepTwo: React.FC<TransactionCreateStepTwoProps> = ({
  receiver,
  sender
}) => {
  const classes = useStyles();
  const [transactionType, setTransactionType] = useState();
  const initialValues = {
    amount: "",
    description: "",
    senderId: sender.id,
    receiverId: receiver.id,
    type: ""
  };

  return (
    <MainContainer>
      <Paper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          <b>TO:</b> {receiver.firstName} {receiver.lastName}
          {transactionType}
        </Typography>
        <Container maxWidth="xs">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting, setFieldValue }) => {
              setSubmitting(true);
              setFieldValue("type", transactionType);

              console.log("VALUES:", values);
              //transactionCreate(values);

              setSubmitting(false);
            }}
          >
            {({ isValid, isSubmitting }) => (
              <Form className={classes.form}>
                <Field name="amount">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      id={"transaction-create-amount-input"}
                      type="text"
                      placeholder="Amount"
                      data-test={"transaction-create-amount-input"}
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched ? meta.error : ""}
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
                      id={"transaction-create-description-input"}
                      type="text"
                      placeholder="Description"
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
                      Payment
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Container>
      </Paper>
    </MainContainer>
  );
};

export default TransactionCreateStepTwo;
