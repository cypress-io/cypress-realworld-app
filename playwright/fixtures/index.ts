import { mergeTests } from "@playwright/test";
import { databaseFixtures } from "./database.fixture";
import { userFixtures } from "./user.fixture";

export const test = mergeTests(databaseFixtures, userFixtures);
export { expect } from "@playwright/test";