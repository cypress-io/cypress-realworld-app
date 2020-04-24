/* eslint-disable import/first */
require("dotenv").config();

import {
  buildDatabase,
  userbaseSize,
  contactsPerUser,
  totalTransactions,
  bankAccountsPerUser,
  totalLikes,
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

  it("should contain a list of likes", () => {
    expect(database).toHaveProperty("likes");
    expect(database.likes.length).toBe(totalLikes);
  });
});
