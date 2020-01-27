import { createLogic } from "redux-logic";
import {
  TRANSACTIONS_PUBLIC_PENDING,
  transactionsPublicSuccess,
  transactionsPublicError
} from "../actions/transactions";

const transactionsPublicLogic = createLogic({
  type: TRANSACTIONS_PUBLIC_PENDING,

  // @ts-ignore
  async process({ httpClient }, dispatch, done) {
    let result;
    try {
      result = await httpClient.get(
        `http://localhost:3001/transactions/public`
      );

      const transactions = result.data.transactions;

      dispatch(transactionsPublicSuccess(transactions));
    } catch (error) {
      // @ts-ignore
      dispatch(transactionsPublicError({ error }));
    }

    done();
  }
});

export default [transactionsPublicLogic];
