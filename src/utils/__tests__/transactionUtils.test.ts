import { isRequestTransaction } from "../transactionUtils";
import faker from "faker";
import {
  Transaction,
  RequestStatus,
  DefaultPrivacyLevel,
  TransactionStatus
} from "../../models";
import shortid from "shortid";

const fakeTransaction = (requestStatus?: RequestStatus): Transaction => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  source: shortid(),
  amount: faker.finance.amount(),
  description: "food",
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: shortid(),
  senderId: shortid(),
  balanceAtCompletion: faker.finance.amount(),
  status: TransactionStatus.pending,
  requestStatus,
  requestResolvedAt: faker.date.future(),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent()
});

describe("isRequestTransaction", () => {
  let transaction;

  test("validates that a transaction is a request", () => {
    for (let s in RequestStatus) {
      transaction = fakeTransaction(s as RequestStatus);
      expect(isRequestTransaction(transaction)).toBeTruthy();
    }
  });

  test("validates that a transaction is not a request", () => {
    transaction = fakeTransaction();
    expect(isRequestTransaction(transaction)).toBe(false);
  });
});
