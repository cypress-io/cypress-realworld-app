import React from "react";
import { styled } from "@mui/material/styles";
import { Interpreter } from "xstate";
import { useActor } from "@xstate/react";
import { Link } from "react-router-dom";
import {
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Typography,
  Container,
} from "@mui/material";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";

import RWALogo from "./SvgRwaLogo";
import Footer from "./Footer";
import { SignInPayload } from "../models";
import { AuthMachineContext, AuthMachineEvents, AuthMachineSchema } from "../machines/authMachine";
import { Alert } from "@mui/material";

const validationSchema = object({
  username: string().required("Username is required"),
  password: string()
    .min(4, "Password must contain at least 4 characters")
    .required("Enter your password"),
});

const PREFIX = "SignInForm";

const classes = {
  paper: `${PREFIX}-paper`,
  logo: `${PREFIX}-logo`,
  form: `${PREFIX}-form`,
  submit: `${PREFIX}-submit`,
  alertMessage: `${PREFIX}-alertMessage`,
};

const StyledContainer = styled(Container)(({ theme }) => ({
  [`& .${classes.paper}`]: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  [`& .${classes.logo}`]: {
    color: theme.palette.primary.main,
  },

  [`& .${classes.form}`]: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },

  [`& .${classes.submit}`]: {
    margin: theme.spacing(3, 0, 2),
  },

  [`& .${classes.alertMessage}`]: {
    marginBottom: theme.spacing(2),
  },
})) as typeof Container;

export interface Props {
  authService: Interpreter<AuthMachineContext, AuthMachineSchema, AuthMachineEvents, any, any>;
}

const SignInForm: React.FC<Props> = ({ authService }) => {
  const [authState, sendAuth] = useActor(authService);
  const initialValues: SignInPayload = {
    username: "",
    password: "",
    remember: undefined,
  };

  const signInPending = (payload: SignInPayload) => sendAuth({ type: "LOGIN", ...payload });

  return (
    <StyledContainer component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {authState.context?.message && (
          <Alert data-test="signin-error" severity="error" className={classes.alertMessage}>
            {authState.context.message}
          </Alert>
        )}
        <div>
          <RWALogo className={classes.logo} />
        </div>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);

            signInPending(values);
          }}
        >
          {({ isValid, isSubmitting }) => (
            <Form className={classes.form}>
              <Field name="username">
                {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="username"
                    label="Username"
                    type="text"
                    autoFocus
                    data-test="signin-username"
                    error={(touched || value !== initialValue) && Boolean(error)}
                    helperText={touched || value !== initialValue ? error : ""}
                    {...field}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="Password"
                    type="password"
                    id="password"
                    data-test="signin-password"
                    error={touched && value !== initialValue && Boolean(error)}
                    helperText={touched && value !== initialValue && touched ? error : ""}
                    {...field}
                  />
                )}
              </Field>
              <FormControlLabel
                control={
                  <Field name={"remember"}>
                    {({ field }: FieldProps) => {
                      return <Checkbox color="primary" data-test="signin-remember-me" {...field} />;
                    }}
                  </Field>
                }
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                data-test="signin-submit"
                disabled={!isValid || isSubmitting}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  {/*<Link to="/forgotpassword">Forgot password?</Link>*/}
                </Grid>
                <Grid item>
                  <Link data-test="signup" to="/signup">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>
      <Box mt={8}>
        <Footer />
      </Box>
    </StyledContainer>
  );
};

export default SignInForm;
