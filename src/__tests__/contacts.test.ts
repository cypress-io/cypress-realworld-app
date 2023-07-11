import { describe, expect, it, beforeEach } from "vitest";
import {
  createContactForUser,
  getContactsByUsername,
  getAllContacts,
  getAllUsers,
  getRandomUser,
  seedDatabase,
  removeContactById,
  getContactsByUserId,
} from "../../backend/database";
import { User } from "../../src/models/user";
import { totalContacts, contactsPerUser } from "../../scripts/seedDataUtils";
describe("Contacts", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should retrieve a list of contacts", () => {
    expect(getAllContacts().length).toEqual(totalContacts);
  });

  it("should retrieve a list of contacts for a username", () => {
    const userToLookup: User = getAllUsers()[0];

    const result = getContactsByUsername(userToLookup.username);
    expect(result.length).toBeGreaterThanOrEqual(contactsPerUser);
    expect(result[0].userId).toBe(userToLookup.id);
  });

  it("should retrieve a list of contacts for a userId", () => {
    const userToLookup: User = getAllUsers()[0];

    const result = getContactsByUserId(userToLookup.id);
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result[0].userId).toBe(userToLookup.id);
  });

  it("should create a contact for user", () => {
    const user: User = getRandomUser();
    const contactToBe: User = getRandomUser();

    const result = createContactForUser(user.id, contactToBe.id);
    expect(result.userId).toBe(user.id);
  });

  it("should delete a contact", () => {
    const userToLookup: User = getRandomUser();

    const contacts = getContactsByUsername(userToLookup.username);

    const contactId = contacts[0].id;

    removeContactById(contactId);

    const updatedContacts = getContactsByUsername(userToLookup.username);
    expect(updatedContacts.length).toBeLessThan(contacts.length);
  });
});
