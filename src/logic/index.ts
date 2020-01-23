import appLogic from "./appLogic";
import signInLogic from "./signInLogic";
import signUpLogic from "./signUpLogic";
import signOutLogic from "./signOutLogic";
import transactionsLogic from "./transactionsLogic";

export default [
  appLogic,
  signInLogic,
  signUpLogic,
  signOutLogic,
  ...transactionsLogic
];
