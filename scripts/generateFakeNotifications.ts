import fs from "fs";
import _ from "lodash";
import shortid from "shortid";
import faker from "faker";
import { getTransactionsForUserContacts } from "../src/backend/database";
import {
  User,
  PaymentNotification,
  PaymentNotificationStatus,
  NotificationType
} from "../src/models";
import { users, getRandomTransactions } from "./utils";

export const createFakePaymentNotification = (
  user_id: string,
  transaction_id: string
): PaymentNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  user_id,
  transaction_id,
  status: faker.helpers.randomize([
    PaymentNotificationStatus.received,
    PaymentNotificationStatus.requested,
    PaymentNotificationStatus.incomplete
  ]),
  is_read: faker.helpers.randomize([true, false]),
  created_at: faker.date.past(),
  modified_at: faker.date.recent()
});

const notifications = users.flatMap((user: User): NotificationType[] => {
  const transactions = getTransactionsForUserContacts(user.id);

  // choose random transactions
  const randomTransactions = getRandomTransactions(5, transactions);

  // get a slice of random transactions
  const selectedTransactions = randomTransactions.slice(0, 2);

  // iterate over transactions and notification
  const paymentNotifications = selectedTransactions.map(transaction =>
    createFakePaymentNotification(user.id, transaction!.id)
  );

  return _.flatten([paymentNotifications]);
});

fs.writeFile(
  __dirname + "/notifications.json",
  JSON.stringify(notifications),
  function() {
    console.log("notification records generated");
  }
);
