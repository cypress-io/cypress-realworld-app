import { sample, reject, uniq, flow } from "lodash/fp";
import { Transaction, User } from "../src/models";

const testSeed = require("../src/data/test-seed.json");
export const users = testSeed.users;
export const contacts = testSeed.contacts;
export const transactions = testSeed.transactions;

// returns a random user other than the one passed in
export const getOtherRandomUser = (userId: string): User =>
  flow(reject(["id", userId]), sample)(users);

export const getRandomTransactions = (
  baseCount: number,
  baseTransactions: Transaction[]
) =>
  uniq(
    Array(baseCount)
      .fill(null)
      .map(() => sample(baseTransactions))
  );
