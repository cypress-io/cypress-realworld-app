import React, { useRef } from "react";
import { styled } from "@mui/material/styles";
import { TextField } from "@mui/material";

const PREFIX = "UserListSearchForm";

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

export interface UserListSearchFormProps {
  userListSearch: Function;
}

const UserListSearchForm: React.FC<UserListSearchFormProps> = ({ userListSearch }) => {
  const inputEl = useRef<HTMLInputElement>(null);

  return (
    <Root>
      <form className={classes.form}>
        <TextField
          variant="outlined"
          margin="dense"
          fullWidth
          name="q"
          type="text"
          placeholder="Search..."
          id="user-list-search-input"
          inputRef={inputEl}
          inputProps={{ "data-test": "user-list-search-input" }}
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
    </Root>
  );
};

export default UserListSearchForm;
