import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";

import Copyright from "./Copyright";

const validationSchema = object({
  username: string().required("Username is required"),
  password: string()
    .min(8, "Password must contain at least 8 characters")
    .required("Enter your password")
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

interface SignInFormValues {
  username: string;
  password: string;
}

const SignIn: React.FC = () => {
  const classes = useStyles();
  const initialValues: SignInFormValues = { username: "", password: "" };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setFieldValue }) => {
            setSubmitting(true);

            console.log("submit: ", values);
            setFieldValue("username", "");
            setFieldValue("password", "");
            setSubmitting(false);
          }}
        >
          {({ isValid, isSubmitting }) => (
            <Form className={classes.form}>
              <Field name="username">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    type="text"
                    autoFocus
                    data-test="signin-username"
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
                    data-test="signin-password"
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched ? meta.error : ""}
                    {...field}
                  />
                )}
              </Field>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
                data-test="signin-remember-me"
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
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
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

export default SignIn;
