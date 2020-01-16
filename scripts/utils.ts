import _ from "lodash";

const testSeed = require("../src/data/test-seed.json");
export const users = testSeed.users;

// returns a random user other than the one passed in
export const getOtherRandomUser = (user_id: string) =>
  _.sample(_.reject(users, ["id", user_id]));
