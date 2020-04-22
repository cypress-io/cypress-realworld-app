import { buildDatabase } from "../../scripts/generateSeedData";
import { TDatabase } from "../../backend/database";

describe("Seed Database", () => {
  let database: TDatabase;
  beforeEach(() => {
    database = buildDatabase();
  });

  it("should contain a list of users", () => {
    expect(database).toHaveProperty("contacts");
    expect(database.contacts.length).toBeGreaterThan(1);
  });
});
