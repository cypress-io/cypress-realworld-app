import { describe, expect, it, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import {
  getBankAccountById,
  getBankAccountsByUserId,
  getRandomUser,
  seedDatabase,
  createBankAccountForUser,
  removeBankAccountById,
} from "../../backend/database";
import { User } from "../../src/models/user";
import { BankAccount } from "../../src/models/bankaccount";
describe("BankAccounts", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should retrieve a list of bank accounts for a user", () => {
    const userToLookup: User = getRandomUser();

    const result = getBankAccountsByUserId(userToLookup.id);
    expect(result[0].userId).toBe(userToLookup.id);
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
    const accountNumber = faker.finance.account(10);

    const accountDetails: Partial<BankAccount> = {
      bankName: `${faker.company.companyName()} Bank`,
      accountNumber,
      routingNumber: faker.finance.account(9),
    };
    const result = createBankAccountForUser(user.id, accountDetails);
    expect(result.userId).toBe(user.id);
  });

  it("should delete a bank account", () => {
    const userToLookup: User = getRandomUser();

    const accounts = getBankAccountsByUserId(userToLookup.id);
    const bankAccountId = accounts[0].id;

    removeBankAccountById(bankAccountId);

    const updatedBankAccounts = getBankAccountsByUserId(userToLookup.id);
    expect(updatedBankAccounts[0].isDeleted).toBe(true);
  });
});
