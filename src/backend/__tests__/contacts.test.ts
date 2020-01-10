import db from "../database";

describe("Contacts", () => {
  it("should retrieve a list of contacts", () => {
    expect(
      db()
        .get("contacts")
        .value().length
    ).toBe(10);
  });
});
