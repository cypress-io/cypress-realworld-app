/* eslint-disable import/first */
require("dotenv").config();

import {
  buildDatabase,
  userbaseSize,
  contactsPerUser,
  totalTransactions,
  bankAccountsPerUser,
} from "../../scripts/generateSeedData";
import { TDatabase } from "../../backend/database";

describe("Seed Database", () => {
  let database: TDatabase;
  beforeEach(() => {
    database = buildDatabase();
  });

  it("should contain a list of users", () => {
    expect(database).toHaveProperty("users");
    expect(database.users.length).toBe(userbaseSize);
  });

  it("should contain a list of contacts", () => {
    expect(database).toHaveProperty("contacts");
    expect(database.contacts.length).toBe(contactsPerUser * userbaseSize);
  });

  it("should contain a list of bankaccounts", () => {
    expect(database).toHaveProperty("bankaccounts");
    expect(database.bankaccounts.length).toBe(
      bankAccountsPerUser * userbaseSize
    );
  });

  it("should contain a list of transactions", () => {
    expect(database).toHaveProperty("transactions");
    expect(database.transactions.length).toBe(totalTransactions);
  });
});
