import appLogic from "./appLogic";
import signInLogic from "./signInLogic";
import signUpLogic from "./signUpLogic";
import signOutLogic from "./signOutLogic";
import transactionsLogic from "./transactionsLogic";
import usersLogic from "./usersLogic";
import notificationsLogic from "./notificationsLogic";
import bankAccountsLogic from "./bankAccountsLogic";

export default [
  appLogic,
  signInLogic,
  signUpLogic,
  signOutLogic,
  ...transactionsLogic,
  ...usersLogic,
  ...notificationsLogic,
  ...bankAccountsLogic
];
