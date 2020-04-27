/* eslint-disable import/first */
require("dotenv").config();

import shortid from "shortid";
import faker from "faker";
import bcrypt from "bcryptjs";
import {
  map,
  flattenDeep,
  times,
  concat,
  sample,
  reject,
  uniq,
  flow,
  get,
  curry,
  filter,
  isEqual,
  flattenDepth,
  negate,
} from "lodash/fp";
import {
  BankAccount,
  User,
  DefaultPrivacyLevel,
  Like,
  Comment,
  PaymentNotification,
  PaymentNotificationStatus,
  NotificationType,
  LikeNotification,
  CommentNotification,
  Transaction,
  TransactionStatus,
  TransactionRequestStatus,
  TransactionScenario,
  FakeTransaction,
  Contact,
} from "../src/models";
import {
  getLikesByTransactionId,
  getCommentsByTransactionId,
} from "../backend/database";
import { getFakeAmount } from "../src/utils/transactionUtils";

export const userbaseSize = +process.env.SEED_USERBASE_SIZE!;
export const contactsPerUser = +process.env.SEED_CONTACTS_PER_USER!;
export const paymentsPerUser = +process.env.SEED_PAYMENTS_PER_USER!;
export const requestsPerUser = +process.env.SEED_REQUESTS_PER_USER!;
export const bankAccountsPerUser = +process.env.SEED_BANK_ACCOUNTS_PER_USER!;
export const likesPerUser = +process.env.SEED_LIKES_PER_USER!;
export const commentsPerUser = +process.env.SEED_COMMENTS_PER_USER!;
export const notificationsPerUser = +process.env.SEED_NOTIFICATIONS_PER_USER!;
export const defaultPassword = process.env.SEED_DEFAULT_USER_PASSWORD!;

export const paymentVariations = 3;
export const requestVariations = 4;
// transactions per user = paymentsPerUser * paymentVariations * sender/receiver(2)
// +
// requestsPerUser * requestVariations * sender/receiver(2)
export const transactionsPerUser =
  paymentsPerUser * paymentVariations * 2 +
  requestsPerUser * requestVariations * 2;
export const totalTransactions = userbaseSize! * transactionsPerUser!;
export const totalLikes = userbaseSize! * likesPerUser!;
export const totalComments = userbaseSize! * commentsPerUser!;
export const totalNotifications = userbaseSize! * notificationsPerUser!;
export const totalContacts = userbaseSize! * contactsPerUser!;

export const isPayment = (type: string) => type === "payment";
export const passwordHash = bcrypt.hashSync(defaultPassword, 10);

export const getRandomTransactions = (
  baseCount: number,
  baseTransactions: Transaction[]
) =>
  uniq(
    Array(baseCount)
      .fill(null)
      .map(() => sample(baseTransactions))
  );

export const createFakeUser = (): User => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName(),
  password: passwordHash,
  email: faker.internet.email(),
  phoneNumber: faker.phone.phoneNumber(),
  avatar: faker.internet.avatar(),
  defaultPrivacyLevel: faker.helpers.randomize([
    DefaultPrivacyLevel.public,
    DefaultPrivacyLevel.private,
    DefaultPrivacyLevel.contacts,
  ]),
  balance: faker.random.number(),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

// @ts-ignore
export const createSeedUsers = () =>
  times(() => createFakeUser(), userbaseSize);

export const createContact = (
  userId: User["id"],
  contactUserId: User["id"]
) => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  contactUserId,
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

// returns a random user other than the one passed in
export const getOtherRandomUser = curry(
  (seedUsers: User[], userId: User["id"]): User =>
    flow(reject(["id", userId]), sample)(seedUsers)
);

export const randomContactsForUser = curry((seedUsers: User[], user: User) =>
  times(() => getOtherRandomUser(seedUsers, user.id), contactsPerUser)
);
export const generateRandomContactsForUser = (seedUsers: User[]) =>
  map((user: User) => ({
    userId: user.id,
    contacts: randomContactsForUser(seedUsers, user),
  }))(seedUsers);

export const createContactsForUser = curry((randomContacts: any) =>
  flattenDeep(
    map((item: any) =>
      map((contact: User) => createContact(item.userId, contact.id))(
        item.contacts
      )
    )(randomContacts)
  )
);

export const createSeedContacts = (seedUsers: User[]) => {
  return flow(generateRandomContactsForUser, createContactsForUser)(seedUsers);
};

export const createSeedBankAccounts = (seedUsers: User[]) =>
  map(
    (user: User): BankAccount => {
      return {
        id: shortid(),
        uuid: faker.random.uuid(),
        userId: user.id,
        bankName: `${faker.company.companyName()} Bank`,
        accountNumber: faker.finance.account(10),
        routingNumber: faker.finance.account(9),
        isDeleted: faker.helpers.randomize([true, false]),
        createdAt: faker.date.past(),
        modifiedAt: faker.date.recent(),
      };
    }
  )(seedUsers);

// Transactions

export const createTransaction = (
  type: "payment" | "request",
  account: BankAccount,
  details: FakeTransaction
): Transaction => {
  const { senderId, receiverId } = details;

  const createdAt = faker.date.past();
  const modifiedAt = faker.date.recent();

  const status = faker.helpers.randomize([
    TransactionStatus.pending,
    TransactionStatus.incomplete,
    TransactionStatus.complete,
  ]);

  let requestStatus = "";

  if (type === "request") {
    requestStatus = TransactionRequestStatus.pending;

    if (status !== TransactionStatus.incomplete) {
      requestStatus = faker.helpers.randomize([
        TransactionRequestStatus.pending,
        TransactionRequestStatus.accepted,
        TransactionRequestStatus.rejected,
      ]);
    }

    if (status === TransactionStatus.complete) {
      requestStatus = faker.helpers.randomize([
        TransactionRequestStatus.accepted,
        TransactionRequestStatus.rejected,
      ]);
    }
  }

  const requestResolvedAt =
    requestStatus === TransactionRequestStatus.pending
      ? ""
      : faker.date.future(undefined, createdAt);

  return {
    id: shortid(),
    uuid: faker.random.uuid(),
    source: account.id,
    amount: getFakeAmount(),
    description: isPayment(type)
      ? `Payment: ${senderId} to ${receiverId}`
      : `Request: ${receiverId} to ${senderId}`,
    privacyLevel: faker.helpers.randomize([
      DefaultPrivacyLevel.public,
      DefaultPrivacyLevel.private,
      DefaultPrivacyLevel.contacts,
    ]),
    receiverId,
    senderId,
    balanceAtCompletion: getFakeAmount(),
    status,
    requestStatus,
    requestResolvedAt,
    createdAt,
    modifiedAt,
  };
};

export const createPayment = (
  account: BankAccount,
  user: User,
  randomUser: User
) => {
  const paymentScenarios: TransactionScenario[] = [
    {
      status: TransactionStatus.pending,
      requestStatus: "",
    },
    {
      status: TransactionStatus.incomplete,
      requestStatus: "",
    },
    {
      status: TransactionStatus.complete,
      requestStatus: "",
    },
  ];

  const allScenarios = paymentScenarios.map((details) => {
    const paymentTransaction = createTransaction("payment", account, {
      senderId: user.id,
      receiverId: randomUser.id,
      ...details,
    });

    const paymentInverseTransaction = createTransaction("payment", account, {
      senderId: randomUser.id,
      receiverId: user.id,
      ...details,
    });

    return [paymentTransaction, paymentInverseTransaction];
  });

  return flattenDeep(allScenarios);
};

export const createRequest = (
  account: BankAccount,
  user: User,
  randomUser: User
) => {
  const requestScenarios: TransactionScenario[] = [
    {
      status: TransactionStatus.pending,
      requestStatus: "pending",
    },
    {
      status: TransactionStatus.incomplete,
      requestStatus: "pending",
    },
    {
      status: TransactionStatus.complete,
      requestStatus: "accepted",
    },
    {
      status: TransactionStatus.complete,
      requestStatus: "rejected",
    },
  ];

  const allScenarios = requestScenarios.map((details) => {
    const requestTransaction = createTransaction("request", account, {
      senderId: user.id,
      receiverId: randomUser.id,
      ...details,
    });

    const requestInverseTransaction = createTransaction("request", account, {
      senderId: randomUser.id,
      receiverId: user.id,
      ...details,
    });

    return [requestTransaction, requestInverseTransaction];
  });

  return flattenDeep(allScenarios);
};

export const getBankAccountsByUserId = (
  seedBankAccounts: BankAccount[],
  userId: User["id"]
): BankAccount[] =>
  filter(flow(get("userId"), isEqual(userId)), seedBankAccounts);

export const createSeedTransactions = (
  seedUsers: User[],
  seedBankAccounts: BankAccount[]
) =>
  flattenDepth(
    2,
    map((user: User): Transaction[] => {
      const accounts = getBankAccountsByUserId(seedBankAccounts, user.id);

      return flattenDepth(
        2,
        map((account: BankAccount): Transaction[] => {
          const randomUser = getOtherRandomUser(seedUsers, user.id);
          // @ts-ignore
          const payments = times(
            () => createPayment(account, user, randomUser),
            paymentsPerUser
          );
          // @ts-ignore
          const requests = times(
            () => createRequest(account, user, randomUser),
            requestsPerUser
          );

          return flattenDeep(concat(payments, requests));
        })(accounts)
      );
    })(seedUsers)
  );

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

export const getPublicTransactionsForOtherUsers = (
  seedTransactions: Transaction[],
  userId: User["id"]
): Transaction[] =>
  flow(
    filter({ privacyLevel: DefaultPrivacyLevel.public }),
    filter(flow(get("senderId"), negate(isEqual(userId)))),
    filter(flow(get("receiverId"), negate(isEqual(userId))))
  )(seedTransactions);

export const createSeedLikes = (
  seedUsers: User[],
  seedTransactions: Transaction[]
) =>
  flattenDeep(
    map((user: User): Like[] => {
      const transactions = getPublicTransactionsForOtherUsers(
        seedTransactions,
        user.id
      );

      // choose random transactions
      const randomTransactions = getRandomTransactions(5, transactions);

      // get a slice of random transactions
      const selectedTransactions = randomTransactions.slice(0, likesPerUser);

      // iterate over transactions and like
      return selectedTransactions.map((transaction) =>
        createFakeLike(user.id, transaction!.id)
      );
    })(seedUsers)
  );

export const createFakeComment = (
  userId: string,
  transactionId: string
): Comment => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  content: faker.lorem.words(),
  userId,
  transactionId,
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

export const createSeedComments = (
  seedUsers: User[],
  seedTransactions: Transaction[]
) =>
  flattenDeep(
    map((user: User): Comment[] => {
      const transactions = getPublicTransactionsForOtherUsers(
        seedTransactions,
        user.id
      );

      // choose random transactions
      const randomTransactions = getRandomTransactions(5, transactions);

      // get a slice of random transactions
      const selectedTransactions = randomTransactions.slice(0, commentsPerUser);

      // iterate over transactions and comment
      return selectedTransactions.map((transaction) =>
        createFakeComment(user.id, transaction!.id)
      );
    })(seedUsers)
  );

export const createFakePaymentNotification = (
  userId: string,
  transactionId: string
): PaymentNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  transactionId,
  status: faker.helpers.randomize([
    PaymentNotificationStatus.received,
    PaymentNotificationStatus.requested,
    PaymentNotificationStatus.incomplete,
  ]),
  isRead: faker.helpers.randomize([true, false]),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

export const createFakeLikeNotification = (
  userId: string,
  transactionId: string,
  likeId: string
): LikeNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  likeId,
  transactionId,
  isRead: faker.helpers.randomize([true, false]),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

export const createFakeCommentNotification = (
  userId: string,
  transactionId: string,
  commentId: string
): CommentNotification => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  userId,
  commentId,
  transactionId,
  isRead: faker.helpers.randomize([true, false]),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

export const createSeedNotifications = (
  seedUsers: User[],
  seedTransactions: Transaction[]
) =>
  flattenDeep(
    map((user: User): NotificationType[] => {
      const transactions = getPublicTransactionsForOtherUsers(
        seedTransactions,
        user.id
      );

      // choose random transactions
      const randomTransactions = getRandomTransactions(5, transactions);

      // get a slice of random transactions
      const selectedTransactions = randomTransactions.slice(
        0,
        notificationsPerUser
      );

      // iterate over transactions and notification
      const transactionNotifications = selectedTransactions.map(
        (transaction) => {
          const likes = getLikesByTransactionId(transaction!.id);
          const comments = getCommentsByTransactionId(transaction!.id);

          let allNotifications = [];

          // payment notification
          allNotifications.push(
            createFakePaymentNotification(user.id, transaction!.id)
          );

          // like notifications
          const likeNotifications = likes.map((like: Like) =>
            createFakeLikeNotification(user.id, transaction!.id, like!.id)
          );

          // comment notifications
          const commentNotifications = comments.map((comment: Comment) =>
            createFakeCommentNotification(user.id, transaction!.id, comment!.id)
          );

          return [allNotifications, likeNotifications, commentNotifications];
        }
      );

      return flattenDeep(transactionNotifications);
    })(seedUsers)
  );

export const buildDatabase = () => {
  const seedUsers: User[] = createSeedUsers();
  const seedContacts: Contact[] = createSeedContacts(seedUsers);
  const seedBankAccounts: BankAccount[] = createSeedBankAccounts(seedUsers);
  const seedTransactions: Transaction[] = createSeedTransactions(
    seedUsers,
    seedBankAccounts
  );
  const seedLikes: Like[] = createSeedLikes(seedUsers, seedTransactions);
  const seedComments: Comment[] = createSeedComments(
    seedUsers,
    seedTransactions
  );
  const seedNotifications: NotificationType[] = createSeedNotifications(
    seedUsers,
    seedTransactions
  );

  return {
    users: seedUsers,
    contacts: seedContacts,
    bankaccounts: seedBankAccounts,
    transactions: seedTransactions,
    likes: seedLikes,
    comments: seedComments,
    notifications: seedNotifications,
    banktransfers: [],
  };
};
