import faker from "faker";
import {
  seedDatabase,
  getTransactionsForUserByObj,
  getTransactionsForUserContacts,
  getAllUsers,
  getAllTransactions,
  getAllPublicTransactions,
  getBankAccountsByUserId,
  createTransaction,
  getTransactionsByUserId,
  updateTransactionById,
  getTransactionById,
  getPublicTransactionsDefaultSort
} from "../database";

import {
  User,
  Transaction,
  RequestStatus,
  DefaultPrivacyLevel
} from "../../models";

describe("Transactions", () => {
  afterEach(() => {
    seedDatabase();
  });
  afterAll(() => {
    seedDatabase();
  });

  it("should retrieve a list of all transactions", () => {
    expect(getAllTransactions().length).toBe(20);
  });

  it("should retrieve a list of all public transactions", () => {
    expect(getAllPublicTransactions().length).toBe(7);
  });

  it("should retrieve a list of transactions for a user", () => {
    const userToLookup: User = getAllUsers()[0];

    const result: Transaction[] = getTransactionsForUserByObj(userToLookup.id, {
      status: "complete"
    });
    expect(result[0].receiverId).toBe(userToLookup.id);
  });

  it("should retrieve a list of transactions for a users contacts", () => {
    const userToLookup: User = getAllUsers()[0];
    const result: Transaction[] = getTransactionsForUserContacts(
      userToLookup.id
    );
    expect(result.length).toBe(9);
  });

  it("should retrieve a list of transactions for a users contacts - status 'incomplete'", () => {
    const userToLookup: User = getAllUsers()[0];
    const result: Transaction[] = getTransactionsForUserContacts(
      userToLookup.id,
      { status: "incomplete" }
    );
    expect(result.length).toBe(1);
  });

  it("should retrieve a list of public transactions, default sort", () => {
    const user: User = getAllUsers()[0];
    const contactsTransactions: Transaction[] = getTransactionsForUserContacts(
      user.id
    );
    expect(contactsTransactions.length).toBe(9);

    const response = getPublicTransactionsDefaultSort(user.id);

    expect(response.contacts.length).toBe(9);
    expect(response.public.length).toBe(4);
    expect(response.contacts[8].id).toBe(contactsTransactions[8].id);
  });

  it("should create a payment", () => {
    const sender: User = getAllUsers()[0];
    const receiver: User = getAllUsers()[1];
    const senderBankAccount = getBankAccountsByUserId(sender.id)[0];
    const amount = faker.finance.amount();

    const paymentDetails: Partial<Transaction> = {
      source: senderBankAccount.id!,
      receiverId: receiver.id,
      description: `Payment: ${sender.id} to ${receiver.id}`,
      amount,
      privacyLevel: DefaultPrivacyLevel.public
    };

    const result = createTransaction(sender.id, "payment", paymentDetails);
    expect(result.id).toBeDefined();
    expect(result.status).toEqual("pending");
    expect(result.requestStatus).not.toBeDefined();
  });

  it("should create a request", () => {
    const sender: User = getAllUsers()[0];
    const receiver: User = getAllUsers()[1];
    const senderBankAccount = getBankAccountsByUserId(sender.id)[0];
    const amount = faker.finance.amount();

    const requestDetails: Partial<Transaction> = {
      source: senderBankAccount.id!,
      receiverId: receiver.id,
      description: `Request: ${sender.id} to ${receiver.id}`,
      amount,
      privacyLevel: DefaultPrivacyLevel.public
    };

    const result = createTransaction(sender.id, "request", requestDetails);
    expect(result.id).toBeDefined();
    expect(result.status).toEqual("pending");
    expect(result.requestStatus).toEqual("pending");
  });

  it("should update a transaction", () => {
    const user: User = getAllUsers()[0];

    const transactions = getTransactionsByUserId(user.id);
    expect(transactions.length).toBe(4);

    const transaction = transactions[0];
    expect(transaction.requestStatus).not.toEqual("rejected");

    const edits: Partial<Transaction> = {
      requestStatus: RequestStatus.rejected
    };
    updateTransactionById(user.id, transaction.id, edits);

    const updatedTransaction = getTransactionById(transaction.id);
    expect(updatedTransaction.requestStatus).toEqual("rejected");
  });
});
