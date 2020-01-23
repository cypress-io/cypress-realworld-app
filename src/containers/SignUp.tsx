import React from "react";
import { connect } from "react-redux";
import { signUpPending } from "../actions/auth";
import SignUpForm from "../components/SignUpForm";
import { User } from "../models";

export interface Props {
  signUpPending: (payload: Partial<User>) => void;
}

const SignUp: React.FC<Props> = ({ signUpPending }) => {
  return <SignUpForm signUpPending={signUpPending} />;
};

const dispatchProps = {
  signUpPending
};

export default connect(undefined, dispatchProps)(SignUp);
