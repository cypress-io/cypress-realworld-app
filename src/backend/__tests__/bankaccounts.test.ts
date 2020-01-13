import faker from "faker";
import {
  getBankAccountById,
  getBankAccountsByUserId,
  getRandomUser,
  seedDatabase,
  createBankAccountForUser,
  removeBankAccountById
} from "../database";
import { User } from "../../models/user";
import { BankAccount } from "../../models/bankaccount";
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

  it("should create a bank account for user", () => {
    const user: User = getRandomUser();
    const account_number = faker.finance.account(10);

    const account_details: Partial<BankAccount> = {
      bank_name: `${faker.company.companyName()} Bank`,
      account_number,
      routing_number: faker.finance.account(9)
    };
    const result = createBankAccountForUser(user.id, account_details);
    expect(result.user_id).toBe(user.id);
  });

  it("should delete a bank account", () => {
    const userToLookup: User = getRandomUser();

    const accounts = getBankAccountsByUserId(userToLookup.id);
    const bankAccountId = accounts[0].id;

    removeBankAccountById(bankAccountId);

    const updatedBankAccounts = getBankAccountsByUserId(userToLookup.id);
    expect(updatedBankAccounts[0].is_deleted).toBe(true);
  });
});
