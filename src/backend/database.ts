import path from "path";
import _ from "lodash";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

let databaseFileName;

if (process.env.NODE_ENV === "test") {
  databaseFileName = "database.test.json";
} else {
  databaseFileName = "database.json";
}

const databaseFile = path.join(__dirname, "../data", databaseFileName);
const adapter = new FileSync(databaseFile);

const db = () => low(adapter);

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
export const getUserBy = (key: string, value: any) =>
  getBy("users", key, value);
export const getUsersBy = (key: string, value: any) =>
  Array.of(getBy("users", key, value));
export const getContactsBy = (key: string, value: any) =>
  Array.of(getBy("contacts", key, value));

// dev/test private methods
export const getRandomUser = () => {
  const users = getAllUsers();
  return _.sample(users);
};

export default db;
