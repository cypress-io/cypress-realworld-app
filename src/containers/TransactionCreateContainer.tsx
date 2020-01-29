import React from "react";
import { connect } from "react-redux";
import MainContainer from "./MainContainer";
import { IRootReducerState } from "../reducers";
import { User } from "../models";
import UsersList from "../components/UsersList";

export interface StateProps {
  searchUsers: User[];
  allUsers: User[];
}

export type TransactionCreateContainerProps = StateProps;

const TransactionCreateContainer: React.FC<TransactionCreateContainerProps> = ({
  allUsers
}) => {
  return (
    <MainContainer>
      <UsersList users={allUsers} />
    </MainContainer>
  );
};

const mapStateToProps = (state: IRootReducerState) => ({
  searchUsers: state.users.search,
  allUsers: state.users.all
});

export default connect(mapStateToProps)(TransactionCreateContainer);
