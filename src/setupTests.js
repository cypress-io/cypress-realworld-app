import { seedDatabase } from "./backend/database";

afterAll(() => {
  seedDatabase();
});
