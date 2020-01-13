import { seedDatabase, getRandomUser, getTransactionsByObj } from "../database";

import { User, Transaction } from "../../models";

describe("Transactions", () => {
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it("should retrieve a list of transactions for a user", () => {
    const userToLookup: User = getRandomUser();

    const result: Transaction[] = getTransactionsByObj({
      receiver_id: userToLookup.id
    });
    expect(result[0].receiver_id).toBe(userToLookup.id);
  });
});
