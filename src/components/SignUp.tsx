import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object, ref } from "yup";

import Copyright from "./Copyright";
import { User } from "../models";

const validationSchema = object({
  first_name: string().required("First Name is required"),
  last_name: string().required("Last Name is required"),
  username: string().required("Username is required"),
  password: string()
    .min(4, "Password must contain at least 4 characters")
    .required("Enter your password"),
  confirmPassword: string()
    .required("Confirm your password")
    .oneOf([ref("password")], "Password does not match")
});

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

export interface Props {
  history?: object;
  signUpPending: (payload: Partial<User>) => void;
}

const SignUp: React.FC<Props> = ({ signUpPending }) => {
  const classes = useStyles();
  const initialValues: Partial<User> & { confirmPassword: string } = {
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    confirmPassword: ""
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setFieldValue }) => {
            setSubmitting(true);

            signUpPending(values);

            setSubmitting(false);
          }}
        >
          {({ isValid, isSubmitting }) => (
            <Form className={classes.form}>
              <Field name="first_name">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="first_name"
                    label="First Name"
                    type="text"
                    autoFocus
                    data-test="signup-first-name"
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched ? meta.error : ""}
                    {...field}
                  />
                )}
              </Field>
              <Field name="last_name">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="last_name"
                    label="Last Name"
                    type="text"
                    autoFocus
                    data-test="signup-last-name"
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched ? meta.error : ""}
                    {...field}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    id="password"
                    data-test="signup-password"
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched ? meta.error : ""}
                    {...field}
                  />
                )}
              </Field>
              <Field name="confirmpassword">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="ConfirmPassword"
                    id="confirmpassword"
                    data-test="signup-confirmpassword"
                    type="password"
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched ? meta.error : ""}
                    {...field}
                  />
                )}
              </Field>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                data-test="signup-submit"
                disabled={!isValid || isSubmitting}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item>
                  <Link to="/signin">{"Have an account? Sign In"}</Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default SignUp;
