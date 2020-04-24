/* eslint-disable import/first */
require("dotenv").config();

import { buildDatabase } from "../../scripts/generateSeedData";
import { TDatabase } from "../../backend/database";

const userbaseSize = +process.env.SEED_USERBASE_SIZE!;
const paymentsPerUser = +process.env.SEED_PAYMENTS_PER_USER!;
const requestsPerUser = +process.env.SEED_REQUESTS_PER_USER!;
const transactionsPerUser = paymentsPerUser + requestsPerUser;
const totalTransactions = userbaseSize! * transactionsPerUser!;

describe("Seed Database", () => {
  let database: TDatabase;
  beforeEach(() => {
    database = buildDatabase();
  });

  it("should contain a list of users", () => {
    expect(database).toHaveProperty("users");
    expect(database.users.length).toBe(5);
  });

  it("should contain a list of contacts", () => {
    expect(database).toHaveProperty("contacts");
    expect(database.contacts.length).toBe(15);
  });

  it("should contain a list of bankaccounts", () => {
    expect(database).toHaveProperty("bankaccounts");
    expect(database.bankaccounts.length).toBe(5);
  });

  it("should contain a list of transactions", () => {
    expect(database).toHaveProperty("transactions");
    expect(database.transactions.length).toBe(totalTransactions);
  });
});
