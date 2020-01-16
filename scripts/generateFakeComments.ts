import fs from "fs";
import shortid from "shortid";
import faker from "faker";
import { getTransactionsForUserContacts } from "../src/backend/database";
import { User, Comment } from "../src/models";
import { users, getRandomTransactions } from "./utils";

export const createFakeComment = (
  user_id: string,
  transaction_id: string
): Comment => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  content: faker.lorem.words(),
  user_id,
  transaction_id,
  created_at: faker.date.past(),
  modified_at: faker.date.recent()
});

const comments = users.flatMap((user: User): Comment[] => {
  const transactions = getTransactionsForUserContacts(user.id);

  // choose random transactions
  const randomTransactions = getRandomTransactions(5, transactions);

  // get a slice of random transactions
  const selectedTransactions = randomTransactions.slice(0, 2);

  // iterate over transactions and comment
  return selectedTransactions.map(transaction =>
    createFakeComment(user.id, transaction!.id)
  );
});

fs.writeFile(
  __dirname + "/comments.json",
  JSON.stringify(comments),
  function() {
    console.log("comment records generated");
  }
);
