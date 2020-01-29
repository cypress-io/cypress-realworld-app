import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";

export interface StateProps {}

export type CreateTransactionContainerProps = StateProps;

const CreateTransactionContainer: React.FC<CreateTransactionContainerProps> = ({}) => {
  return <MainContainer>Hello</MainContainer>;
};

const mapStateToProps = (state: IRootReducerState) => ({
  //searchUsers: state.users.search,
  //contacts: state.users.contacts,
  //allUsers: state.users.all,
});

export default connect(mapStateToProps)(CreateTransactionContainer);
