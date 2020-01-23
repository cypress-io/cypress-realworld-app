import React from "react";
import { connect } from "react-redux";
import { signInPending } from "../actions/auth";
import SignInForm from "../components/SignInForm";
import { User } from "../models";

export interface Props {
  signInPending: (payload: Partial<User>) => void;
}

const SignIn: React.FC<Props> = ({ signInPending }) => {
  return <SignInForm signInPending={signInPending} />;
};

const dispatchProps = {
  signInPending
};

export default connect(undefined, dispatchProps)(SignIn);
