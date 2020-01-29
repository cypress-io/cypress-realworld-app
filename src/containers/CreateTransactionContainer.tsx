import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { User } from "../models";

export interface StateProps {
  searchUsers: User[];
  allUsers: User[];
}

export type CreateTransactionContainerProps = StateProps;

const CreateTransactionContainer: React.FC<CreateTransactionContainerProps> = ({
  searchUsers,
  allUsers
}) => {
  return <MainContainer>Hello</MainContainer>;
};

const mapStateToProps = (state: IRootReducerState) => ({
  searchUsers: state.users.search,
  allUsers: state.users.all
});

export default connect(mapStateToProps)(CreateTransactionContainer);
