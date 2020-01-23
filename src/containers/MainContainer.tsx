import React from "react";
import { connect } from "react-redux";
import { signOutPending } from "../actions/auth";
import MainLayout from "../components/MainLayout";

export interface Props {
  signOutPending: () => void;
}

const MainContainer: React.FC<Props> = ({ signOutPending, children }) => {
  return <MainLayout signOutPending={signOutPending}>{children}</MainLayout>;
};

const dispatchProps = {
  signOutPending
};

export default connect(undefined, dispatchProps)(MainContainer);
