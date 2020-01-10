import {
  createContactForUser,
  getContactsByUsername,
  getAllContacts,
  getRandomUser,
  seedDatabase
} from "../database";
import { User } from "../../models/user";
describe("Contacts", () => {
  afterEach(() => {
    seedDatabase();
  });

  it("should retrieve a list of contacts", () => {
    expect(getAllContacts().length).toBe(10);
  });

  it("should retrieve a list of contacts for a username", () => {
    const userToLookup: User = getRandomUser();

    const result = getContactsByUsername(userToLookup.username);
    expect(result[0].user_id).toBe(userToLookup.id);
  });

  it("should create a contact for user", () => {
    const user: User = getRandomUser();
    const contactToBe: User = getRandomUser();

    const result = createContactForUser(user.id, contactToBe.id);
    expect(result.user_id).toBe(user.id);
  });
});
