import {
  getBankAccountById,
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

  it("should retrieve a bank accounts by id", () => {
    const userToLookup: User = getRandomUser();

    const accounts = getBankAccountsByUserId(userToLookup.id);
    const bankAccountId = accounts[0].id;

    const account = getBankAccountById(bankAccountId);

    expect(account.id).toEqual(bankAccountId);
  });
});
