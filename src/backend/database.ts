import path from "path";
import v4 from "uuid";
import _ from "lodash";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import shortid from "shortid";
import {
  BankAccount,
  Transaction,
  User,
  Contact,
  TransactionStatus,
  RequestStatus,
  Like,
  Comment,
  PaymentNotification,
  PaymentNotificationStatus,
  LikeNotification,
  CommentNotification,
  NotificationType,
  NotificationPayloadType,
  NotificationsType,
  PaymentNotificationPayload
} from "../models";

const USER_TABLE = "users";
const CONTACT_TABLE = "contacts";
const BANK_ACCOUNT_TABLE = "bankaccounts";
const TRANSACTION_TABLE = "transactions";
const LIKE_TABLE = "likes";
const COMMENT_TABLE = "comments";
const NOTIFICATION_TABLE = "notifications";

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
    .filter({ privacy_level: "public" })
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

export const getAllByObj = (entity: string, query: object) =>
  db()
    .get(entity)
    // @ts-ignore
    .filter(query)
    .value();

export const getByObj = (entity: string, query: object) =>
  db()
    .get(entity)
    // @ts-ignore
    .find(query)
    .value();

// convenience methods

// User
export const getUserBy = (key: string, value: any) =>
  getBy(USER_TABLE, key, value);
export const getUsersBy = (key: string, value: any) => {
  const users = getBy(USER_TABLE, key, value);
  return users ? Array.of(getBy(USER_TABLE, key, value)) : [];
};

// Contact
export const getContactBy = (key: string, value: any) =>
  getBy(CONTACT_TABLE, key, value);
export const getContactsBy = (key: string, value: any) =>
  getAllBy(CONTACT_TABLE, key, value);

export const getContactsByUsername = (username: string) => {
  const user: User = getUserBy("username", username);
  const userContacts: Contact[] = getContactsBy("user_id", user.id);
  return userContacts;
};

export const getContactsByUserId = (user_id: string): Contact[] =>
  getContactsBy("user_id", user_id);

export const createContact = (contact: Contact) => {
  db()
    .get(CONTACT_TABLE)
    // @ts-ignore
    .push(contact)
    .write();

  // manual lookup after create
  return getContactBy("id", contact.id);
};

export const removeContactById = (contact_id: string) => {
  const contact = getContactBy("id", contact_id);

  db()
    .get(CONTACT_TABLE)
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

// Bank Account
export const getBankAccountBy = (key: string, value: any) =>
  getBy(BANK_ACCOUNT_TABLE, key, value);

export const getBankAccountById = (id: string) => getBankAccountBy("id", id);
export const getBankAccountsBy = (key: string, value: any) => {
  const accounts = getBy(BANK_ACCOUNT_TABLE, key, value);
  return accounts ? Array.of(accounts) : [];
};
export const getBankAccountsByUserId = (user_id: string) => {
  const accounts: BankAccount[] = getBankAccountsBy("user_id", user_id);
  return accounts;
};

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
  user_id: string,
  account_details: Partial<BankAccount>
) => {
  const accountId = shortid();
  const bankaccount: BankAccount = {
    id: accountId,
    uuid: v4(),
    user_id,
    bank_name: account_details.bank_name!,
    account_number: account_details.account_number!,
    routing_number: account_details.routing_number!,
    is_deleted: false,
    created_at: new Date(),
    modified_at: new Date()
  };

  // TODO: check if bank account exists

  // Write bank account record to the database
  const result = createBankAccount(bankaccount);

  return result;
};

export const removeBankAccountById = (bank_account_id: string) => {
  db()
    .get(BANK_ACCOUNT_TABLE)
    // @ts-ignore
    .find({ id: bank_account_id })
    .assign({ is_deleted: true }) // soft delete
    .write();
};

// Transaction

export const getTransactionBy = (key: string, value: any) =>
  getBy(TRANSACTION_TABLE, key, value);

export const getTransactionById = (id: string) => getTransactionBy("id", id);
export const getTransactionsBy = (key: string, value: string) =>
  getAllBy(TRANSACTION_TABLE, key, value);
export const getTransactionsByObj = (query: object) =>
  getAllByObj(TRANSACTION_TABLE, query);
export const getTransactionsForUserByObj = (
  user_id: string,
  query?: object
) => {
  const transactions: Transaction[] = getTransactionsByObj({
    receiver_id: user_id,
    ...query
  });
  return transactions;
};
export const getTransactionsByUserId = (user_id: string) => {
  const transactions: Transaction[] = getTransactionsBy("receiver_id", user_id);
  return transactions;
};

export const getTransactionsForUserContacts = (
  user_id: string,
  query?: object
) => {
  const contacts = getContactsByUserId(user_id);
  const contactIds = _.map(contacts, "contact_user_id");
  return contactIds.flatMap((contactId): Transaction[] => {
    return getTransactionsForUserByObj(contactId, query);
  });
};

export const getPublicTransactionsDefaultSort = (userId: string) => {
  const contactsTransactions = getTransactionsForUserContacts(userId);
  const contactsTransactionIds = _.map(contactsTransactions, "id");
  const allPublicTransactions = getAllPublicTransactions();

  const nonContactPublicTransactions = _.reject(allPublicTransactions, t =>
    _.includes(contactsTransactionIds, t.id)
  );

  return {
    contacts: contactsTransactions,
    public: nonContactPublicTransactions
  };
};

export const createTransaction = (
  userId: User["id"],
  transactionType: "payment" | "request",
  transactionDetails: Partial<Transaction>
): Transaction => {
  const transaction: Transaction = {
    id: shortid(),
    uuid: v4(),
    source: transactionDetails.source!,
    amount: transactionDetails.amount!,
    description: transactionDetails.description!,
    receiver_id: transactionDetails.receiver_id!,
    sender_id: userId,
    privacy_level: transactionDetails.privacy_level!,
    status: TransactionStatus.pending,
    request_status:
      transactionType === "request" ? RequestStatus.pending : undefined,
    created_at: new Date(),
    modified_at: new Date()
  };

  const savedTransaction = saveTransaction(transaction);
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

  if (userId === transaction.sender_id || userId === transaction.receiver_id) {
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
export const getLikesByTransactionId = (transaction_id: string) =>
  getLikesByObj({ transaction_id });

export const createLike = (user_id: string, transaction_id: string): Like => {
  const like = {
    id: shortid(),
    uuid: v4(),
    user_id,
    transaction_id,
    created_at: new Date(),
    modified_at: new Date()
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
export const getCommentsByTransactionId = (transaction_id: string) =>
  getCommentsByObj({ transaction_id });

export const createComment = (
  user_id: string,
  transaction_id: string,
  content: string
): Comment => {
  const comment = {
    id: shortid(),
    uuid: v4(),
    content,
    user_id,
    transaction_id,
    created_at: new Date(),
    modified_at: new Date()
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

export const getNotificationsByUserId = (user_id: string) =>
  getNotificationsByObj({ user_id });

export const getNotificationsByTransactionId = (transaction_id: string) =>
  getNotificationsByObj({ transaction_id });

export const getNotificationsByLikeId = (like_id: string) =>
  getNotificationsByObj({ like_id });

export const getNotificationsByCommentId = (comment_id: string) =>
  getNotificationsByObj({ comment_id });

export const createPaymentNotification = (
  userId: string,
  transactionId: string,
  status: PaymentNotificationStatus
): PaymentNotification => {
  const notification: PaymentNotification = {
    id: shortid(),
    uuid: v4(),
    user_id: userId,
    transaction_id: transactionId,
    status,
    is_read: false,
    created_at: new Date(),
    modified_at: new Date()
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
    user_id: userId,
    transaction_id: transactionId,
    like_id: likeId,
    is_read: false,
    created_at: new Date(),
    modified_at: new Date()
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
    user_id: userId,
    transaction_id: transactionId,
    comment_id: commentId,
    is_read: false,
    created_at: new Date(),
    modified_at: new Date()
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
      return createPaymentNotification(
        userId,
        item.transaction_id,
        item.status
      );
    } else if ("like_id" in item && item.type === NotificationsType.like) {
      return createLikeNotification(userId, item.transaction_id, item.like_id);
    } else {
      if ("comment_id" in item) {
        return createCommentNotification(
          userId,
          item.transaction_id,
          item.comment_id
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

  if (userId === notification.user_id) {
    db()
      .get(NOTIFICATION_TABLE)
      // @ts-ignore
      .find(notification)
      .assign(edits)
      .write();
  }
};

// dev/test private methods
export const getRandomUser = () => {
  const users = getAllUsers();
  return _.sample(users);
};

export default db;
