import path from "path";
import fs from "fs";
import { buildDatabase } from "./seedDataUtils";
import { TDatabase } from "../backend/database";
const testSeed: TDatabase = buildDatabase();

const fileData = JSON.stringify(testSeed, null, 2);

fs.writeFile(path.join(process.cwd(), "data", "database-seed.json"), fileData, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("test seed generated");
});
