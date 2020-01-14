import {
  createContactForUser,
  getContactsByUsername,
  getAllContacts,
  getAllUsers,
  getRandomUser,
  seedDatabase,
  removeContactById
} from "../database";
import { User } from "../../models/user";
describe("Contacts", () => {
  afterEach(() => {
    seedDatabase();
  });

  it("should retrieve a list of contacts", () => {
    expect(getAllContacts().length).toBe(11);
  });

  it("should retrieve a list of contacts for a username", () => {
    const userToLookup: User = getAllUsers()[0];

    const result = getContactsByUsername(userToLookup.username);
    expect(result.length).toBe(2);
    expect(result[0].user_id).toBe(userToLookup.id);
  });

  it("should create a contact for user", () => {
    const user: User = getRandomUser();
    const contactToBe: User = getRandomUser();

    const result = createContactForUser(user.id, contactToBe.id);
    expect(result.user_id).toBe(user.id);
  });

  it("should delete a contact", () => {
    const userToLookup: User = getRandomUser();

    const contacts = getContactsByUsername(userToLookup.username);
    //expect(result[0].user_id).toBe(userToLookup.id);

    const contactId = contacts[0].id;

    removeContactById(contactId);

    const updatedContacts = getContactsByUsername(userToLookup.username);
    expect(updatedContacts).toEqual([]);
  });
});
