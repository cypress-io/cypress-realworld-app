import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId
} from "../database";

import { User, Transaction } from "../../models";

describe("Transactions", () => {
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it.skip("should get a list of likes for a transaction", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];
    //const like = createLike(transaction.id);

    //const likes = getLikesForTransaction(transaction.id);

    //expect(likes.transaction_id).toBe(transaction.id);
  });

  it("should like a transaction for a contact", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

    const like = createLike(transactions[0].id);

    expect(like.transaction_id).toBe(transactions[0].id);
  });
});
