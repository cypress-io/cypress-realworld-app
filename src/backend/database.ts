import path from "path";
import v4 from "uuid";
import _ from "lodash";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { User } from "../models/user";
import { Contact } from "../models/contact";
import shortid from "shortid";
import { BankAccount } from "../models/bankaccount";

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

export const getBy = (entity: string, key: string, value: any) =>
  db()
    .get(entity)
    // @ts-ignore
    .find({ [`${key}`]: value })
    .value();

// convenience methods
export const getContactBy = (key: string, value: any) =>
  getBy("contacts", key, value);
export const getUserBy = (key: string, value: any) =>
  getBy("users", key, value);
export const getUsersBy = (key: string, value: any) => {
  const users = getBy("users", key, value);
  return users ? Array.of(getBy("users", key, value)) : [];
};
export const getContactsBy = (key: string, value: any) => {
  const contacts = getBy("contacts", key, value);
  return contacts ? Array.of(getBy("contacts", key, value)) : [];
};

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

export const getBankAccountBy = (key: string, value: any) =>
  getBy("bankaccounts", key, value);

export const getBankAccountById = (id: string) => getBankAccountBy("id", id);
export const getBankAccountsBy = (key: string, value: any) => {
  const accounts = getBy("bankaccounts", key, value);
  return accounts ? Array.of(accounts) : [];
};
export const getBankAccountsByUserId = (user_id: string) => {
  const accounts: BankAccount[] = getBankAccountsBy("user_id", user_id);
  return accounts;
};

// dev/test private methods
export const getRandomUser = () => {
  const users = getAllUsers();
  return _.sample(users);
};

export default db;
