import { isRequestTransaction, getFakeAmount } from "../transactionUtils";
import faker from "faker";
import {
  Transaction,
  TransactionRequestStatus,
  DefaultPrivacyLevel,
  TransactionStatus
} from "../../models";
import shortid from "shortid";

const fakeTransaction = (
  requestStatus?: TransactionRequestStatus
): Transaction => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  source: shortid(),
  amount: getFakeAmount(),
  description: "food",
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: shortid(),
  senderId: shortid(),
  balanceAtCompletion: getFakeAmount(),
  status: TransactionStatus.pending,
  requestStatus,
  requestResolvedAt: faker.date.future(),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent()
});

describe("isRequestTransaction", () => {
  let transaction;

  test("validates that a transaction is a request", () => {
    for (let s in TransactionRequestStatus) {
      transaction = fakeTransaction(s as TransactionRequestStatus);
      expect(isRequestTransaction(transaction)).toBeTruthy();
    }
  });

  test("validates that a transaction is not a request", () => {
    transaction = fakeTransaction();
    expect(isRequestTransaction(transaction)).toBe(false);
  });
});
