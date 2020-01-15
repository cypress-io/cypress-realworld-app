import fs from "fs";
import _ from "lodash";
import shortid from "shortid";
import faker from "faker";
import { getTransactionsForUserContacts } from "../src/backend/database";
import { User, Like } from "../src/models";
import { users, getRandomTransactions, getOtherRandomUser } from "./utils";

export const createLike = (user_id: string, transaction_id: string): Like => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  user_id,
  transaction_id,
  created_at: faker.date.past(),
  modified_at: faker.date.recent()
});

const likes = users.map((user: User): Like[] => {
  const transactions = getTransactionsForUserContacts(user.id);

  // choose random transactions
  const randomTransactions = getRandomTransactions(5, transactions).slice(0, 2);

  // iterate over transactions and like
  const likes = randomTransactions.map(transaction =>
    createLike(user.id, transaction.id)
  );
  return likes;
});

fs.writeFile(__dirname + "/likes.json", JSON.stringify(likes), function() {
  console.log("like records generated");
});
