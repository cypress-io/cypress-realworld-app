import _ from "lodash";
import { Transaction } from "../src/models";

const testSeed = require("../src/data/test-seed.json");
export const users = testSeed.users;
export const contacts = testSeed.contacts;
export const transactions = testSeed.transactions;

// returns a random user other than the one passed in
export const getOtherRandomUser = (user_id: string) =>
  _.sample(_.reject(users, ["id", user_id]));

export const getRandomTransactions = (
  baseCount: number,
  transactions: Transaction[]
) =>
  _.uniq(
    Array(baseCount)
      .fill(null)
      .map(() => _.sample(transactions))
  );
