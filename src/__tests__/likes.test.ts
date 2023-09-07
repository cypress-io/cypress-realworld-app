import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId,
  createLike,
  getLikesByTransactionId,
} from "../../backend/database";

import { User, Transaction } from "../../src/models";

describe("Transactions", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should like a transaction for a contact", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

    const like = createLike(user.id, transactions[0].id);

    expect(like.transactionId).toBe(transactions[0].id);
  });

  it("should get a list of likes for a transaction", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    createLike(user.id, transaction.id);

    const likes = getLikesByTransactionId(transaction.id);

    expect(likes[0].transactionId).toBe(transaction.id);
  });
});
