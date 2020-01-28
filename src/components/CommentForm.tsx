import React from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";

const validationSchema = object({
  comment: string()
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
  }
}));

export interface CommentFormProps {
  transactionId: string;
  transactionComment: (payload: object) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  transactionId,
  transactionComment
}) => {
  const classes = useStyles();
  const initialValues = { comment: "" };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, setFieldValue }) => {
          setSubmitting(true);

          transactionComment({ transactionId, ...values });

          setFieldValue("comment", "");
          setSubmitting(false);
        }}
      >
        {() => (
          <Form className={classes.form}>
            <Field name="comment">
              {({ field, meta }: FieldProps) => (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  id={`transaction-comment-${transactionId}`}
                  type="text"
                  placeholder="Write a comment..."
                  data-test={`transaction-comment-${transactionId}`}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched ? meta.error : ""}
                  {...field}
                />
              )}
            </Field>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CommentForm;
