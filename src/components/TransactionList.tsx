import React from "react";
import { connect } from "react-redux";
import { IAppState } from "../reducers";
import { Data } from "../reducers/app";
import TransactionCard from "./TransactionCard";

export interface OwnProps {
  history?: object;
}

interface StateProps {
  data: Data[];
}

interface DispatchProps {}

type Props = StateProps & DispatchProps & OwnProps;

const TransactionList: React.FC<Props> = ({ data }) => (
  <div className="w-full md:w-1/2 mx-auto">
    <h2 className="w-full mx-auto text-gray-800 text-lg font-semibold ml-5 pt-2 px-2">
      Recent Transactions
    </h2>
    <ul data-cy="transaction-list">
      {data.map((i: any) => (
        <TransactionCard transaction={i} />
      ))}
    </ul>
  </div>
);

const mapStateToProps = (state: IAppState, ownProps: OwnProps) => ({
  data: state.app.sampleData
});

const dispatchProps = {};

export default connect(mapStateToProps, dispatchProps)(TransactionList);
