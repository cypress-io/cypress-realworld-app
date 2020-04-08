import fs from "fs";
import shortid from "shortid";
import faker from "faker";
import { getTransactionsForUserContacts } from "../src/backend/database";
import { User, Like } from "../src/models";
import { users, getRandomTransactions } from "./utils";

export const createFakeLike = (
  userId: string,
  transactionId: string
): Like => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  transactionId,
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

const likes = users.flatMap((user: User): Like[] => {
  const transactions = getTransactionsForUserContacts(user.id);

  // choose random transactions
  const randomTransactions = getRandomTransactions(5, transactions);

  // get a slice of random transactions
  const selectedTransactions = randomTransactions.slice(0, 2);

  // iterate over transactions and like
  return selectedTransactions.map((transaction) =>
    createFakeLike(user.id, transaction!.id)
  );
});

fs.writeFile(__dirname + "/likes.json", JSON.stringify(likes), function () {
  console.log("like records generated");
});
