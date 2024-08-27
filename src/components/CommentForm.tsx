import React from "react";
import { styled } from "@mui/material/styles";
import { TextField } from "@mui/material";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";

const validationSchema = object({
  content: string(),
});

const PREFIX = "CommentForm";

const classes = {
  paper: `${PREFIX}-paper`,
  form: `${PREFIX}-form`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.paper}`]: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  [`& .${classes.form}`]: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
}));

export interface CommentFormProps {
  transactionId: string;
  transactionComment: (payload: object) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ transactionId, transactionComment }) => {
  const initialValues = { content: "" };

  return (
    <Root>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(true);
          transactionComment({ transactionId, ...values });
        }}
      >
        {() => (
          <Form className={classes.form}>
            <Field name="content">
              {({ field, meta }: FieldProps) => (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  id={`transaction-comment-input-${transactionId}`}
                  type="text"
                  placeholder="Write a comment..."
                  inputProps={{ "data-test": `transaction-comment-input-${transactionId}` }}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched ? meta.error : ""}
                  {...field}
                />
              )}
            </Field>
          </Form>
        )}
      </Formik>
    </Root>
  );
};

export default CommentForm;
