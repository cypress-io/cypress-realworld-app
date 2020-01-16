import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId,
  createComment,
  getCommentsByTransactionId
} from "../database";

import { User, Transaction } from "../../models";

describe("Transactions", () => {
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it("should comment a transaction for a contact", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

    const content = "This is my comment content";
    const comment = createComment(user.id, transactions[0].id, content);

    expect(comment.transaction_id).toBe(transactions[0].id);
    expect(comment.content).toBe(content);
  });

  it("should get a list of comments for a transaction", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    createComment(user.id, transaction.id);

    const comments = getCommentsByTransactionId(transaction.id);

    expect(comments[0].transaction_id).toBe(transaction.id);
  });
});
