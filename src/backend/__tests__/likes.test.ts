import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId,
  createLike,
  getLikesByTransactionId
} from "../database";

import { User, Transaction } from "../../models";

describe("Transactions", () => {
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it("should like a transaction for a contact", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

    const like = createLike(user.id, transactions[0].id);

    expect(like.transaction_id).toBe(transactions[0].id);
  });

  it("should get a list of likes for a transaction", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    createLike(user.id, transaction.id);

    const likes = getLikesByTransactionId(transaction.id);

    expect(likes[0].transaction_id).toBe(transaction.id);
  });
});
