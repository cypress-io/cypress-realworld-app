import { seedDatabase, getAllUsers, searchUsers } from "../../backend/database";

import { User } from "../models";

describe("Users", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should get a user by email address", () => {
    const userToLookup: User = getAllUsers()[0];
    const { email } = userToLookup;

    const users = searchUsers(email);

    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0].id).toBe(userToLookup.id);
  });

  it("should get a user by username", () => {
    const userToLookup: User = getAllUsers()[0];
    const { username } = userToLookup;

    const users = searchUsers(username);

    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0].id).toBe(userToLookup.id);
  });

  it("should get a user by phone number", () => {
    const userToLookup: User = getAllUsers()[0];
    const { phoneNumber } = userToLookup;

    const users = searchUsers(phoneNumber);

    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0].id).toBe(userToLookup.id);
  });

  it("should get a list of users by alpha (username, email) (fuzzy match)", () => {
    const userToLookup: User = getAllUsers()[0];
    const users = searchUsers(userToLookup.firstName);

    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it("should get a list of users by phone (fuzzy match)", () => {
    const users = searchUsers("201");

    expect(users.length).toBeGreaterThanOrEqual(1);
  });
});
