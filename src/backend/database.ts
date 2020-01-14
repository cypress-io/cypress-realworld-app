import path from "path";
import v4 from "uuid";
import _ from "lodash";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { User } from "../models/user";
import { Contact } from "../models/contact";
import shortid from "shortid";
import { BankAccount } from "../models/bankaccount";
import { Transaction } from "../models";

const BANK_ACCOUNT_TABLE = "bankaccounts";
const TRANSACTION_TABLE = "transactions";

const testSeed = require(path.join(__dirname, "../data/", "test-seed.json"));
let databaseFileName;

if (process.env.NODE_ENV === "test") {
  databaseFileName = "database.test.json";
} else {
  databaseFileName = "database.json";
}

const databaseFile = path.join(__dirname, "../data", databaseFileName);
const adapter = new FileSync(databaseFile);

const db = () => low(adapter);

export const seedDatabase = () => {
  // seed database with test data
  // @ts-ignore
  db()
    .setState(testSeed)
    .write();
  console.log("test data seeded into test database");
};
export const getAllUsers = () =>
  db()
    .get("users")
    .value();

export const getAllContacts = () =>
  db()
    .get("contacts")
    .value();

export const getAllBy = (entity: string, key: string, value: any) => {
  const result = db()
    .get(entity)
    // @ts-ignore
    .filter({ [`${key}`]: value })
    .value();

  return result;
};

export const getBy = (entity: string, key: string, value: any) => {
  const result = db()
    .get(entity)
    // @ts-ignore
    .find({ [`${key}`]: value })
    .value();

  return result;
};

export const getByObj = (entity: string, query: object) =>
  db()
    .get(entity)
    // @ts-ignore
    .find(query)
    .value();

// convenience methods

// User
export const getUserBy = (key: string, value: any) =>
  getBy("users", key, value);
export const getUsersBy = (key: string, value: any) => {
  const users = getBy("users", key, value);
  return users ? Array.of(getBy("users", key, value)) : [];
};

// Contact
export const getContactBy = (key: string, value: any) =>
  getBy("contacts", key, value);
export const getContactsBy = (key: string, value: any) =>
  getAllBy("contacts", key, value);

export const getContactsByUsername = (username: string) => {
  const user: User = getUserBy("username", username);
  const userContacts: Contact[] = getContactsBy("user_id", user.id);
  return userContacts;
};

export const createContact = (contact: Contact) => {
  db()
    .get("contacts")
    // @ts-ignore
    .push(contact)
    .write();

  // manual lookup after create
  return getContactBy("id", contact.id);
};

export const removeContactById = (contact_id: string) => {
  const contact = getContactBy("id", contact_id);

  db()
    .get("contacts")
    // @ts-ignore
    .remove(contact)
    .write();
};

export const createContactForUser = (
  user_id: string,
  contact_user_id: string
) => {
  const contactId = shortid();
  const contact: Contact = {
    id: contactId,
    uuid: v4(),
    user_id,
    contact_user_id,
    created_at: new Date(),
    modified_at: new Date()
  };

  // TODO: check if contact exists

  // Write contact record to the database
  const result = createContact(contact);

  return result;
};

// Bank Account
export const getBankAccountBy = (key: string, value: any) =>
  getBy(BANK_ACCOUNT_TABLE, key, value);

export const getBankAccountById = (id: string) => getBankAccountBy("id", id);
export const getBankAccountsBy = (key: string, value: any) => {
  const accounts = getBy(BANK_ACCOUNT_TABLE, key, value);
  return accounts ? Array.of(accounts) : [];
};
export const getBankAccountsByUserId = (user_id: string) => {
  const accounts: BankAccount[] = getBankAccountsBy("user_id", user_id);
  return accounts;
};

export const createBankAccount = (bankaccount: BankAccount) => {
  db()
    .get(BANK_ACCOUNT_TABLE)
    // @ts-ignore
    .push(bankaccount)
    .write();

  // manual lookup after create
  return getBankAccountBy("id", bankaccount.id);
};

export const createBankAccountForUser = (
  user_id: string,
  account_details: Partial<BankAccount>
) => {
  const accountId = shortid();
  const bankaccount: BankAccount = {
    id: accountId,
    uuid: v4(),
    user_id,
    bank_name: account_details.bank_name!,
    account_number: account_details.account_number!,
    routing_number: account_details.routing_number!,
    is_deleted: false,
    created_at: new Date(),
    modified_at: new Date()
  };

  // TODO: check if bank account exists

  // Write bank account record to the database
  const result = createBankAccount(bankaccount);

  return result;
};

export const removeBankAccountById = (bank_account_id: string) => {
  db()
    .get(BANK_ACCOUNT_TABLE)
    // @ts-ignore
    .find({ id: bank_account_id })
    .assign({ is_deleted: true }) // soft delete
    .write();
};

// Transaction

export const getTransactionBy = (key: string, value: any) =>
  getBy(TRANSACTION_TABLE, key, value);

export const getTransactionById = (id: string) => getTransactionBy("id", id);
export const getTransactionsBy = (key: string, value: string) => {
  const transactions = getBy(TRANSACTION_TABLE, key, value);
  return transactions ? Array.of(transactions) : [];
};
export const getTransactionsByObj = (query: object) => {
  const transactions = getByObj(TRANSACTION_TABLE, query);
  return transactions ? Array.of(transactions) : [];
};
export const getTransactionsForUserByObj = (user_id: string, query: object) => {
  const transactions: Transaction[] = getTransactionsByObj({
    receiver_id: user_id,
    ...query
  });
  return transactions;
};
export const getTransactionsByUserId = (user_id: string) => {
  const transactions: Transaction[] = getTransactionsBy("receiver_id", user_id);
  return transactions;
};

// dev/test private methods
export const getRandomUser = () => {
  const users = getAllUsers();
  return _.sample(users);
};

export default db;
