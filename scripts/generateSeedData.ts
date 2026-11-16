import path from "path";
import fs from "fs";
import { buildDatabase } from "./seedDataUtils";
import { writeAvatars } from "./avatarUtils";
import { TDatabase } from "../backend/database";
const testSeed: TDatabase = buildDatabase();

const fileData = JSON.stringify(testSeed, null, 2);

fs.writeFile(path.join(process.cwd(), "data", "database-seed.json"), fileData, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  writeAvatars(testSeed.users.map(({ id }) => id));
  console.log("test seed generated");
});
