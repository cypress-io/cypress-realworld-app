import { sample, reject, uniq } from "lodash";
import { Transaction } from "../src/models";

const testSeed = require("../src/data/test-seed.json");
export const users = testSeed.users;
export const contacts = testSeed.contacts;
export const transactions = testSeed.transactions;

// returns a random user other than the one passed in
export const getOtherRandomUser = (userId: string) =>
  sample(reject(["id", userId], users));

export const getRandomTransactions = (
  baseCount: number,
  baseTransactions: Transaction[]
) =>
  uniq(
    Array(baseCount)
      .fill(null)
      .map(() => sample(baseTransactions))
  );
