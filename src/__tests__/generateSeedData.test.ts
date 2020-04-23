import { buildDatabase } from "../../scripts/generateSeedData";
import { TDatabase } from "../../backend/database";

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
});
