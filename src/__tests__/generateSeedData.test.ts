import {
  buildDatabase,
  userbaseSize,
  contactsPerUser,
  totalTransactions,
  bankAccountsPerUser,
  totalLikes,
  totalComments,
  totalNotifications,
  totalBankTransfers,
} from "../../scripts/seedDataUtils";
import { TDatabase } from "../../backend/database";

describe.skip("Seed Database", () => {
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
    expect(database.bankaccounts.length).toBe(bankAccountsPerUser * userbaseSize);
  });

  it("should contain a list of transactions", () => {
    expect(database).toHaveProperty("transactions");
    expect(database.transactions.length).toBe(totalTransactions);
  });

  it("should contain a list of likes", () => {
    expect(database).toHaveProperty("likes");
    expect(database.likes.length).toBe(totalLikes);
  });

  it("should contain a list of comments", () => {
    expect(database).toHaveProperty("comments");
    expect(database.comments.length).toBe(totalComments);
  });

  it("should contain a list of notifications", () => {
    expect(database).toHaveProperty("notifications");
    expect(database.notifications.length).toBeGreaterThanOrEqual(totalNotifications);
  });

  it("should contain a list of bank transfers", () => {
    expect(database).toHaveProperty("banktransfers");
    expect(database.banktransfers.length).toBeLessThanOrEqual(totalBankTransfers);
  });
});
