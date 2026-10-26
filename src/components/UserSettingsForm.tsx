import React from "react";
import { styled } from "@mui/material/styles";
import { TextField, Button, Grid } from "@mui/material";
import { Formik, Form, Field, FieldProps } from "formik";
import { User, UserSettingsPayload } from "../models";
import { userSettingsValidationSchema } from "../utils/userSettingsValidation";

const PREFIX = "UserSettingsForm";

const classes = {
  paper: `${PREFIX}-paper`,
  form: `${PREFIX}-form`,
};

const StyledFormik = styled(Formik)(({ theme }) => ({
  [`& .${classes.paper}`]: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const MarginHonoringDiv = styled("div")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

export interface UserSettingsProps {
  userProfile: User;
  updateUser: Function;
}

const UserSettingsForm: React.FC<UserSettingsProps> = ({ userProfile, updateUser }) => {
  const initialValues: UserSettingsPayload & { jobTitle: string } = {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    phoneNumber: userProfile.phoneNumber,
    defaultPrivacyLevel: userProfile.defaultPrivacyLevel,
    jobTitle: "",
  };

  return (
    <StyledFormik
      initialValues={initialValues}
      validationSchema={userSettingsValidationSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        // The job title is required on the form; it is not stored on the user yet.
        const { jobTitle, ...profileSettings } = values;
        updateUser({ id: userProfile.id, ...profileSettings });
        setSubmitting(false);
      }}
    >
      {({ isValid, isSubmitting }) => (
        <MarginHonoringDiv>
          <Form data-test="user-settings-form">
            <Field name="firstName">
              {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                  id={"user-settings-firstName-input"}
                  type="text"
                  placeholder="First Name"
                  inputProps={{ "data-test": "user-settings-firstName-input" }}
                  error={(touched || value !== initialValue) && Boolean(error)}
                  helperText={touched || value !== initialValue ? error : ""}
                  {...field}
                />
              )}
            </Field>
            <Field name="lastName">
              {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                  id={"user-settings-lastName-input"}
                  type="text"
                  placeholder="Last Name"
                  inputProps={{ "data-test": "user-settings-lastName-input" }}
                  error={(touched || value !== initialValue) && Boolean(error)}
                  helperText={touched || value !== initialValue ? error : ""}
                  {...field}
                />
              )}
            </Field>
            <Field name="email">
              {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                  id={"user-settings-email-input"}
                  type="text"
                  placeholder="Email"
                  inputProps={{ "data-test": "user-settings-email-input" }}
                  error={(touched || value !== initialValue) && Boolean(error)}
                  helperText={touched || value !== initialValue ? error : ""}
                  {...field}
                />
              )}
            </Field>
            <Field name="phoneNumber">
              {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                  id={"user-settings-phoneNumber-input"}
                  type="text"
                  placeholder="Phone Number"
                  inputProps={{ "data-test": "user-settings-phoneNumber-input" }}
                  error={(touched || value !== initialValue) && Boolean(error)}
                  helperText={touched || value !== initialValue ? error : ""}
                  {...field}
                />
              )}
            </Field>
            <Field name="jobTitle">
              {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                  id={"user-settings-jobTitle-input"}
                  type="text"
                  placeholder="Job Title"
                  inputProps={{ "data-test": "user-settings-jobTitle-input" }}
                  error={(touched || value !== initialValue) && Boolean(error)}
                  helperText={touched || value !== initialValue ? error : ""}
                  {...field}
                />
              )}
            </Field>
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 3, marginLeft: 0, marginBottom: 2 }}
                  data-test="user-settings-submit"
                  disabled={!isValid || isSubmitting}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </Form>
        </MarginHonoringDiv>
      )}
    </StyledFormik>
  );
};

export default UserSettingsForm;
