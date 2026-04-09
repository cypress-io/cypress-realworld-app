import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId,
  createComment,
  getCommentsByTransactionId,
} from "../../backend/database";

import { User, Transaction } from "../../src/models";

describe("Comments", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should comment a transaction for a contact", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

    const content = "This is my comment content";
    const comment = createComment(user.id, transactions[0].id, content);

    expect(comment.transactionId).toBe(transactions[0].id);
    expect(comment.content).toBe(content);
  });

  it("should get a list of comments for a transaction", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    createComment(user.id, transaction.id, "This is my comment");

    const comments = getCommentsByTransactionId(transaction.id);

    expect(comments[0].transactionId).toBe(transaction.id);
  });
});
