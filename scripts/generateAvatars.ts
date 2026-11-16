import path from "path";
import fs from "fs";
import { writeAvatars } from "./avatarUtils";

// Writes an avatar for every local avatar path in the test seed
const seed = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "database-seed.json"), "utf-8")
);

const seeds = seed.users
  .map(({ avatar }: { avatar: string }) => avatar.match(/^\/img\/avatars\/(.+)\.svg$/)?.[1])
  .filter(Boolean)
  .map(decodeURIComponent);

writeAvatars(seeds);
console.log(`wrote ${seeds.length} avatars`);
