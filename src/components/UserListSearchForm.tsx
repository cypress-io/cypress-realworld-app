import React, { useRef } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

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

export interface UserListSearchFormProps {
  userListSearch: Function;
}

const UserListSearchForm: React.FC<UserListSearchFormProps> = ({
  userListSearch
}) => {
  const classes = useStyles();
  const inputEl = useRef<HTMLInputElement>(null);

  return (
    <div>
      <form className={classes.form}>
        <TextField
          variant="outlined"
          margin="dense"
          fullWidth
          name="q"
          type="text"
          placeholder="Search..."
          id="user-list-search-input"
          data-test="user-list-search-input"
          inputRef={inputEl}
          onFocus={() => {
            if (null !== inputEl.current) {
              inputEl.current.value = "";
              inputEl.current.focus();
            }
          }}
          onChange={({ target: { value: q } }) => {
            userListSearch({ q });
          }}
        />
      </form>
    </div>
  );
};

export default UserListSearchForm;
