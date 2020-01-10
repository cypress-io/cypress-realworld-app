import {
  getContactsByUsername,
  getAllContacts,
  getRandomUser
} from "../database";
import { User } from "../../models/user";

describe("Contacts", () => {
  it("should retrieve a list of contacts", () => {
    expect(getAllContacts().length).toBe(10);
  });

  it("should retrieve a list of contacts for a username", () => {
    const userToLookup: User = getRandomUser();

    const result = getContactsByUsername(userToLookup.username);
    expect(result[0].user_id).toBe(userToLookup.id);
  });
});
