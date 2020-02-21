import path from "path";
import fs from "fs";
import v4 from "uuid";
import {
  uniqBy,
  map,
  sample,
  reject,
  includes,
  orderBy,
  flow,
  flatMap,
  curry,
  get,
  constant,
  filter
} from "lodash/fp";
import { isWithinRange } from "date-fns";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import shortid from "shortid";
import {
  BankAccount,
  Transaction,
  User,
  Contact,
  TransactionStatus,
  TransactionRequestStatus,
  Like,
  Comment,
  PaymentNotification,
  PaymentNotificationStatus,
  LikeNotification,
  CommentNotification,
  NotificationType,
  NotificationPayloadType,
  NotificationsType,
  TransactionResponseItem,
  TransactionPayload,
  BankTransfer,
  BankTransferPayload,
  BankTransferType,
  NotificationResponseItem,
  TransactionQueryPayload
} from "../models";
import Fuse from "fuse.js";
import {
  isPayment,
  getTransferAmount,
  hasSufficientFunds,
  getChargeAmount,
  getFullNameForUser,
  getQueryWithoutDateFields,
  hasDateQueryFields,
  getDateQueryFields
} from "../utils/transactionUtils";

const USER_TABLE = "users";
const CONTACT_TABLE = "contacts";
const BANK_ACCOUNT_TABLE = "bankaccounts";
const TRANSACTION_TABLE = "transactions";
const LIKE_TABLE = "likes";
const COMMENT_TABLE = "comments";
const NOTIFICATION_TABLE = "notifications";
const BANK_TRANSFER_TABLE = "banktransfers";

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
  const testSeed = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "src/data", "test-seed.json"),
      "utf-8"
    )
  );
  // seed database with test data
  // @ts-ignore
  db()
    .setState(testSeed)
    .write();
};
export const getAllUsers = () =>
  db()
    .get(USER_TABLE)
    .value();

export const getAllContacts = () =>
  db()
    .get(CONTACT_TABLE)
    .value();

export const getAllTransactions = () =>
  db()
    .get(TRANSACTION_TABLE)
    .value();

export const getAllPublicTransactions = () =>
  db()
    .get(TRANSACTION_TABLE)
    // @ts-ignore
    .filter({ privacyLevel: "public" })
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

export const getAllByObj = (entity: string, query: object) => {
  const result = db()
    .get(entity)
    // @ts-ignore
    .filter(query)
    .value();

  return result;
};
export const getByObj = (entity: string, query: object) =>
  db()
    .get(entity)
    // @ts-ignore
    .find(query)
    .value();

// Search
export const cleanSearchQuery = (query: string) =>
  query.replace(/[^a-zA-Z0-9]/g, "");

export const setupSearch = curry((items: [], options: {}, query: string) => {
  const fuse = new Fuse(items, options);
  return fuse.search(query);
});

export const performSearch = (items: [], options: {}, query: string) =>
  flow(cleanSearchQuery, setupSearch(items, options))(query);

export const searchUsers = (query: string) => {
  const items = getAllUsers();
  return performSearch(
    items,
    {
      keys: ["username", "email", "phoneNumber"]
    },
    query
  ) as User[];
};

// convenience methods

// User
export const getUserBy = (key: string, value: any) =>
  getBy(USER_TABLE, key, value);
export const getUserId = (user: User): string => user.id;
export const getUserById = (id: string) => getUserBy("id", id);
export const getUserByUsername = (username: string) =>
  getUserBy("username", username);
export const getUsersBy = (key: string, value: any) =>
  getAllBy(USER_TABLE, key, value);

export const createUser = (userDetails: Partial<User>): User => {
  const user: User = {
    id: shortid(),
    uuid: v4(),
    firstName: userDetails.firstName!,
    lastName: userDetails.lastName!,
    username: userDetails.username!,
    password: userDetails.password!,
    email: userDetails.email!,
    phoneNumber: userDetails.phoneNumber!,
    balance: userDetails.balance!,
    avatar: userDetails.avatar!,
    defaultPrivacyLevel: userDetails.defaultPrivacyLevel!,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  saveUser(user);
  return user;
};

const saveUser = (user: User) => {
  db()
    .get(USER_TABLE)
    // @ts-ignore
    .push(user)
    .write();
};

export const updateUserById = (userId: string, edits: Partial<User>) => {
  const user = getUserById(userId);

  if (user) {
    db()
      .get(USER_TABLE)
      // @ts-ignore
      .find(user)
      .assign(edits)
      .write();
  }
};

// Contact
export const getContactBy = (key: string, value: any) =>
  getBy(CONTACT_TABLE, key, value);

export const getContactsBy = (key: string, value: any) =>
  getAllBy(CONTACT_TABLE, key, value);

export const getContactsByUsername = (username: string) =>
  flow(getUserByUsername, getUserId, getContactsByUserId)(username);

export const getContactsByUserId = (userId: string): Contact[] =>
  getContactsBy("userId", userId);

export const createContact = (contact: Contact) => {
  db()
    .get(CONTACT_TABLE)
    // @ts-ignore
    .push(contact)
    .write();

  // manual lookup after create
  return getContactBy("id", contact.id);
};

export const removeContactById = (contactId: string) => {
  const contact = getContactBy("id", contactId);

  db()
    .get(CONTACT_TABLE)
    // @ts-ignore
    .remove(contact)
    .write();
};

export const createContactForUser = (userId: string, contactUserId: string) => {
  const contactId = shortid();
  const contact: Contact = {
    id: contactId,
    uuid: v4(),
    userId,
    contactUserId,
    createdAt: new Date(),
    modifiedAt: new Date()
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

export const getBankAccountsBy = (key: string, value: any) =>
  getAllBy(BANK_ACCOUNT_TABLE, key, value);

export const getBankAccountsByUserId = (userId: string) =>
  getBankAccountsBy("userId", userId);

export const getActiveBankAccountsByUserId = (userId: string) =>
  getAllByObj(BANK_ACCOUNT_TABLE, { userId, isDeleted: false });

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
  userId: string,
  accountDetails: Partial<BankAccount>
) => {
  const accountId = shortid();
  const bankaccount: BankAccount = {
    id: accountId,
    uuid: v4(),
    userId,
    bankName: accountDetails.bankName!,
    accountNumber: accountDetails.accountNumber!,
    routingNumber: accountDetails.routingNumber!,
    isDeleted: false,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  // TODO: check if bank account exists

  // Write bank account record to the database
  const result = createBankAccount(bankaccount);

  return result;
};

export const removeBankAccountById = (bankAccountId: string) => {
  db()
    .get(BANK_ACCOUNT_TABLE)
    // @ts-ignore
    .find({ id: bankAccountId })
    .assign({ isDeleted: true }) // soft delete
    .write();
};

// Bank Transfer

export const getBankTransferBy = (key: string, value: any) =>
  getBy(BANK_TRANSFER_TABLE, key, value);

export const getBankTransferById = (id: string) => getBankTransferBy("id", id);

export const getBankTransfersBy = (key: string, value: any) =>
  getAllBy(BANK_TRANSFER_TABLE, key, value);

export const getBankTransfersByUserId = (userId: string) =>
  getBankTransfersBy("userId", userId);

export const getBankTransferByTransactionId = (transactionId: string) =>
  getBankTransferBy("transactionId", transactionId);

export const createBankTransfer = (
  bankTransferDetails: BankTransferPayload
) => {
  const bankTransfer: BankTransfer = {
    id: shortid(),
    uuid: v4(),
    ...bankTransferDetails,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  const savedBankTransfer = saveBankTransfer(bankTransfer);
  return savedBankTransfer;
};

const saveBankTransfer = (bankTransfer: BankTransfer): BankTransfer => {
  db()
    .get(BANK_TRANSFER_TABLE)
    // @ts-ignore
    .push(bankTransfer)
    .write();

  // manual lookup after banktransfer created
  return getBankTransferBy("id", bankTransfer.id);
};

// Transaction

export const getTransactionBy = (key: string, value: any) =>
  getBy(TRANSACTION_TABLE, key, value);

export const getTransactionById = (id: string) => getTransactionBy("id", id);

export const getTransactionsBy = (key: string, value: string) =>
  getAllBy(TRANSACTION_TABLE, key, value);

export const getTransactionsByObj = (query: object) =>
  getAllByObj(TRANSACTION_TABLE, query);

export const getTransactionByIdForApi = (id: string) =>
  formatTransactionForApiResponse(getTransactionBy("id", id));

export const getTransactionsForUserForApi = (userId: string, query?: object) =>
  flow(getTransactionsForUserByObj, formatTransactionsForApiResponse)(
    userId,
    query
  );

export const formatTransactionForApiResponse = (
  transaction: Transaction
): TransactionResponseItem => {
  const receiverName = getFullNameForUser(transaction.receiverId);
  const senderName = getFullNameForUser(transaction.senderId);
  const likes = getLikesByTransactionId(transaction.id);
  const comments = getCommentsByTransactionId(transaction.id);

  return {
    receiverName,
    senderName,
    likes,
    comments,
    ...transaction
  };
};

export const formatTransactionsForApiResponse = (
  transactions: Transaction[]
): TransactionResponseItem[] =>
  orderBy(
    [(transaction: Transaction) => new Date(transaction.modifiedAt)],
    ["desc"],
    transactions.map(transaction =>
      formatTransactionForApiResponse(transaction)
    )
  );

export const getAllTransactionsForUserByObj = (
  userId: string,
  query?: object
) => {
  console.log("QUERY: ", query);
  const queryWithoutDateFields = query && getQueryWithoutDateFields(query);

  const queryFields = queryWithoutDateFields || query;
  const userTransactions = flatMap(getTransactionsByObj)([
    {
      receiverId: userId,
      ...queryFields
    },
    {
      senderId: userId,
      ...queryFields
    }
  ]);

  if (query && hasDateQueryFields(query)) {
    const { dateRangeStart, dateRangeEnd } = getDateQueryFields(query);

    const filteredTransactions = transactionsWithinDateRange(
      dateRangeStart!,
      dateRangeEnd!,
      userTransactions
    );

    return filteredTransactions;
  } else {
    return userTransactions;
  }
};

export const transactionsWithinDateRange = (
  dateRangeStart: string,
  dateRangeEnd: string,
  transactions: Transaction[]
) =>
  filter(
    (transaction: Transaction) =>
      isWithinRange(
        new Date(transaction.createdAt),
        new Date(dateRangeStart),
        new Date(dateRangeEnd)
      ),
    transactions
  );

export const getTransactionsForUserByObj = (userId: string, query?: object) =>
  flow(getAllTransactionsForUserByObj, uniqBy("id"))(userId, query);

export const getTransactionsByUserId = (userId: string) =>
  getTransactionsBy("receiverId", userId);

export const getContactIdsForUser = (userId: string): Contact["id"][] =>
  flow(getContactsByUserId, map("contactUserId"))(userId);

export const getTransactionsForUserContacts = (
  userId: string,
  query?: object
) =>
  uniqBy(
    "id",
    flatMap(
      contactId => getTransactionsForUserForApi(contactId, query),
      getContactIdsForUser(userId)
    )
  );

export const getTransactionIds = (transactions: Transaction[]) =>
  map("id", transactions);

export const getContactsTransactionIds = (
  userId: string
): Transaction["id"][] =>
  flow(getTransactionsForUserContacts, getTransactionIds)(userId);

export const nonContactPublicTransactions = (userId: string): Transaction[] => {
  const contactsTransactionIds = getContactsTransactionIds(userId);
  return flow(
    getAllPublicTransactions,
    reject((transaction: Transaction) =>
      includes(transaction.id, contactsTransactionIds)
    )
  )(userId);
  /*
  TODO: investigate xorBy implementation
  return xorBy(
    getAllPublicTransactions,
    getTransactionsForUserContacts(userId),
    "id"
  );
  */
};

export const getNonContactPublicTransactionsForApi = (userId: string) =>
  flow(nonContactPublicTransactions, formatTransactionsForApiResponse)(userId);

export const getPublicTransactionsDefaultSort = (userId: string) => ({
  contacts: getTransactionsForUserContacts(userId),
  public: getNonContactPublicTransactionsForApi(userId)
});

export const getPublicTransactionsByQuery = (
  userId: string,
  query: TransactionQueryPayload
) => {
  if (query && hasDateQueryFields(query)) {
    const { dateRangeStart, dateRangeEnd } = getDateQueryFields(query);

    return {
      contacts: getTransactionsForUserContacts(userId, query),
      public: transactionsWithinDateRange(
        dateRangeStart!,
        dateRangeEnd!,
        getNonContactPublicTransactionsForApi(userId)
      )
    };
  } else {
    return {
      contacts: getTransactionsForUserContacts(userId),
      public: getNonContactPublicTransactionsForApi(userId)
    };
  }
};

export const resetPayAppBalance = constant(0);

export const updatePayAppBalance = (sender: User, transaction: Transaction) => {
  if (hasSufficientFunds(sender, transaction)) {
    flow(
      getChargeAmount,
      savePayAppBalance(sender)
      // TODO: generate notification?
    )(sender, transaction);
  } else {
    flow(
      getTransferAmount,
      createBankTransferWithdrawal(sender, transaction),
      // TODO: generate notification for withdrawal
      resetPayAppBalance,
      savePayAppBalance(sender)
    )(sender, transaction);
  }
};

export const createBankTransferWithdrawal = curry(
  (sender: User, transaction: Transaction, transferAmount: number) =>
    createBankTransfer({
      userId: sender.id,
      source: transaction.source,
      amount: transferAmount,
      transactionId: transaction.id,
      type: BankTransferType.withdrawal
    })
);

export const savePayAppBalance = curry((sender: User, balance: number) =>
  updateUserById(get("id", sender), { balance })
);

export const createTransaction = (
  userId: User["id"],
  transactionType: "payment" | "request",
  transactionDetails: TransactionPayload
): Transaction => {
  const sender = getUserById(userId);
  const transaction: Transaction = {
    id: shortid(),
    uuid: v4(),
    source: transactionDetails.source,
    amount: transactionDetails.amount,
    description: transactionDetails.description,
    receiverId: transactionDetails.receiverId,
    senderId: userId,
    privacyLevel: transactionDetails.privacyLevel || sender.defaultPrivacyLevel,
    status: TransactionStatus.pending,
    requestStatus:
      transactionType === "request"
        ? TransactionRequestStatus.pending
        : undefined,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  const savedTransaction = saveTransaction(transaction);

  // if payment, debit sender's balance for payment amount
  if (isPayment(transaction)) {
    updatePayAppBalance(sender, transaction);
    // TODO: update transaction "status"
    updateTransactionById(sender.id, transaction.id, {
      status: TransactionStatus.complete
    });
    // TODO: generate notification for transaction - createPaymentNotification(...)
    createPaymentNotification(
      transaction.receiverId,
      transaction.id,
      PaymentNotificationStatus.received
    );
  }

  return savedTransaction;
};

const saveTransaction = (transaction: Transaction): Transaction => {
  db()
    .get(TRANSACTION_TABLE)
    // @ts-ignore
    .push(transaction)
    .write();

  // manual lookup after transaction created
  return getTransactionBy("id", transaction.id);
};

export const updateTransactionById = (
  userId: string,
  transactionId: string,
  edits: Partial<Transaction>
) => {
  const transaction = getTransactionBy("id", transactionId);

  // TODO: if request accepted - createBankTransfer for withdrawal for the difference associated to the transaction
  // TODO: generate notification for update (request)
  if (userId === transaction.senderId || userId === transaction.receiverId) {
    db()
      .get(TRANSACTION_TABLE)
      // @ts-ignore
      .find(transaction)
      .assign(edits)
      .write();
  }
};

// Likes

export const getLikeBy = (key: string, value: any): Like =>
  getBy(LIKE_TABLE, key, value);
export const getLikesByObj = (query: object) => getAllByObj(LIKE_TABLE, query);

export const getLikeById = (id: string): Like => getLikeBy("id", id);
export const getLikesByTransactionId = (transactionId: string) =>
  getLikesByObj({ transactionId });

export const createLike = (userId: string, transactionId: string): Like => {
  const like = {
    id: shortid(),
    uuid: v4(),
    userId,
    transactionId,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  const savedLike = saveLike(like);
  return savedLike;
};

const saveLike = (like: Like): Like => {
  db()
    .get(LIKE_TABLE)
    // @ts-ignore
    .push(like)
    .write();

  // manual lookup after like created
  return getLikeById(like.id);
};

// Comments

export const getCommentBy = (key: string, value: any): Comment =>
  getBy(COMMENT_TABLE, key, value);
export const getCommentsByObj = (query: object) =>
  getAllByObj(COMMENT_TABLE, query);

export const getCommentById = (id: string): Comment => getCommentBy("id", id);
export const getCommentsByTransactionId = (transactionId: string) =>
  getCommentsByObj({ transactionId });

export const createComment = (
  userId: string,
  transactionId: string,
  content: string
): Comment => {
  const comment = {
    id: shortid(),
    uuid: v4(),
    content,
    userId,
    transactionId,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  const savedComment = saveComment(comment);
  return savedComment;
};

const saveComment = (comment: Comment): Comment => {
  db()
    .get(COMMENT_TABLE)
    // @ts-ignore
    .push(comment)
    .write();

  // manual lookup after comment created
  return getCommentById(comment.id);
};

// Notifications

export const getNotificationBy = (key: string, value: any): NotificationType =>
  getBy(NOTIFICATION_TABLE, key, value);

export const getNotificationsByObj = (query: object): Notification[] =>
  getAllByObj(NOTIFICATION_TABLE, query);

export const getNotificationById = (id: string): NotificationType =>
  getNotificationBy("id", id);

export const getUnreadNotificationsByUserId = (userId: string) =>
  flow(
    getNotificationsByObj,
    formatNotificationsForApiResponse
  )({ userId, isRead: false });

export const getNotificationsByUserId = (userId: string) =>
  getNotificationsByObj({ userId });

export const getNotificationsByTransactionId = (transactionId: string) =>
  getNotificationsByObj({ transactionId });

export const getNotificationsByLikeId = (likeId: string) =>
  getNotificationsByObj({ likeId });

export const getNotificationsByCommentId = (commentId: string) =>
  getNotificationsByObj({ commentId });

export const createPaymentNotification = (
  userId: string,
  transactionId: string,
  status: PaymentNotificationStatus
): PaymentNotification => {
  const notification: PaymentNotification = {
    id: shortid(),
    uuid: v4(),
    userId: userId,
    transactionId: transactionId,
    status,
    isRead: false,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  saveNotification(notification);
  return notification;
};

export const createLikeNotification = (
  userId: string,
  transactionId: string,
  likeId: string
): LikeNotification => {
  const notification: LikeNotification = {
    id: shortid(),
    uuid: v4(),
    userId: userId,
    transactionId: transactionId,
    likeId: likeId,
    isRead: false,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  saveNotification(notification);
  return notification;
};

export const createCommentNotification = (
  userId: string,
  transactionId: string,
  commentId: string
): CommentNotification => {
  const notification: CommentNotification = {
    id: shortid(),
    uuid: v4(),
    userId: userId,
    transactionId: transactionId,
    commentId: commentId,
    isRead: false,
    createdAt: new Date(),
    modifiedAt: new Date()
  };

  saveNotification(notification);
  return notification;
};

const saveNotification = (notification: NotificationType) => {
  db()
    .get(NOTIFICATION_TABLE)
    // @ts-ignore
    .push(notification)
    .write();
};

export const createNotifications = (
  userId: string,
  notifications: NotificationPayloadType[]
) =>
  notifications.flatMap((item: NotificationPayloadType) => {
    if ("status" in item && item.type === NotificationsType.payment) {
      return createPaymentNotification(userId, item.transactionId, item.status);
    } else if ("likeId" in item && item.type === NotificationsType.like) {
      return createLikeNotification(userId, item.transactionId, item.likeId);
    } else {
      if ("commentId" in item) {
        return createCommentNotification(
          userId,
          item.transactionId,
          item.commentId
        );
      }
    }
  });

export const updateNotificationById = (
  userId: string,
  notificationId: string,
  edits: Partial<NotificationType>
) => {
  const notification = getNotificationBy("id", notificationId);

  if (userId === notification.userId) {
    db()
      .get(NOTIFICATION_TABLE)
      // @ts-ignore
      .find(notification)
      .assign(edits)
      .write();
  }
};

export const formatNotificationForApiResponse = (
  notification: NotificationType
): NotificationResponseItem => {
  const userFullName = getFullNameForUser(notification.userId);

  return {
    userFullName,
    ...notification
  };
};

export const formatNotificationsForApiResponse = (
  notifications: NotificationResponseItem[]
): NotificationResponseItem[] =>
  orderBy(
    [
      (notification: NotificationResponseItem) =>
        new Date(notification.modifiedAt)
    ],
    ["desc"],
    notifications.map(notification =>
      formatNotificationForApiResponse(notification)
    )
  );

// dev/test private methods
export const getRandomUser = () => {
  const users = getAllUsers();
  return sample(users);
};

export default db;
