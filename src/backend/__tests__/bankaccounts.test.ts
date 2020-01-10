import {
  getBankAccountsByUserId,
  getRandomUser,
  seedDatabase
} from "../database";
import { User } from "../../models/user";
describe("BankAccounts", () => {
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it("should retrieve a list of bank accounts for a user", () => {
    const userToLookup: User = getRandomUser();

    const result = getBankAccountsByUserId(userToLookup.id);
    expect(result[0].user_id).toBe(userToLookup.id);
  });
});
