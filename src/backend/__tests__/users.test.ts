import { seedDatabase, getAllUsers, getUserBy } from "../database";

import { User } from "../../models";

describe("Users", () => {
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it("should get a user by email address", () => {
    const userToLookup: User = getAllUsers()[0];
    const { email } = userToLookup;

    const user = getUserBy("email", email);

    expect(user.id).toBe(userToLookup.id);
  });
});
