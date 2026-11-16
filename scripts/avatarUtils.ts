import path from "path";
import fs from "fs";

// Avatars are generated locally and served with the app, so pages don't depend on
// an external avatar service being up or fast
const AVATAR_DIR = path.join(__dirname, "..", "public", "img", "avatars");
const GRID_SIZE = 8;

const hash = (seed: string) => {
  // FNV-1a, so the same seed always draws the same avatar
  let value = 0x811c9dc5;

  for (const char of seed) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 0x01000193) >>> 0;
  }

  return value;
};

export const getAvatarPath = (seed: string) => `/img/avatars/${encodeURIComponent(seed)}.svg`;

export const createAvatarSvg = (seed: string) => {
  let state = hash(seed);
  const next = () => {
    state = Math.imul(state ^ (state >>> 15), 0x2c1b3c6d) >>> 0;
    state = (state ^ (state >>> 12)) >>> 0;

    return state;
  };

  const hue = next() % 360;
  const cells: string[] = [];

  // Fill the left half and mirror it, so the avatar is symmetric like a face
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE / 2; x++) {
      if (next() % 2) {
        cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
        cells.push(`<rect x="${GRID_SIZE - 1 - x}" y="${y}" width="1" height="1"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_SIZE} ${GRID_SIZE}" shape-rendering="crispEdges"><rect width="${GRID_SIZE}" height="${GRID_SIZE}" fill="hsl(${hue}, 60%, 90%)"/><g fill="hsl(${hue}, 55%, 40%)">${cells.join("")}</g></svg>\n`;
};

export const writeAvatars = (seeds: string[]) => {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });

  for (const seed of seeds) {
    fs.writeFileSync(
      path.join(AVATAR_DIR, `${encodeURIComponent(seed)}.svg`),
      createAvatarSvg(seed)
    );
  }
};
