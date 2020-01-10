import {
  getContactsBy,
  getAllContacts,
  getRandomUser,
  getUserBy
} from "../database";
import { User } from "../../models/user";
import { Contact } from "../../models/contact";

describe("Contacts", () => {
  it("should retrieve a list of contacts", () => {
    expect(getAllContacts().length).toBe(10);
  });

  it("should retrieve a list of contacts for a username", () => {
    const userToLookup: User = getRandomUser();

    const user: User = getUserBy("username", userToLookup.username);
    expect(user.first_name).toBe(userToLookup.first_name);

    const userContacts: Contact[] = getContactsBy("user_id", user.id);
    expect(userContacts[0].user_id).toBe(user.id);

    //const result = getContactsByUsername(userToLookup)
    //expect(result.length)
  });
});
