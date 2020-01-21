import React from "react";
import { connect } from "react-redux";
import Typography from "@material-ui/core/Typography";
import { IAppState } from "../reducers";
import { Data } from "../reducers/app";
import TransactionItem from "./TransactionItem";
import List from "@material-ui/core/List";

export interface OwnProps {
  history?: object;
}

interface StateProps {
  data: Data[];
}

interface DispatchProps {}

type Props = StateProps & DispatchProps & OwnProps;

const TransactionList: React.FC<Props> = ({ data }) => (
  <>
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      Recent Transactions
    </Typography>
    <List data-test="transaction-list">
      <TransactionItem
        transaction={{ id: 1, to: "Kevin", from: "Amir", amount: 50 }}
      />
      {data.map((i: any) => (
        <TransactionItem transaction={i} />
      ))}
    </List>
  </>
);

const mapStateToProps = (state: IAppState, ownProps: OwnProps) => ({
  data: state.app.sampleData
});

const dispatchProps = {};

export default connect(mapStateToProps, dispatchProps)(TransactionList);
