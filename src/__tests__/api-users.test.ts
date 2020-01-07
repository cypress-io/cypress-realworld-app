import request from "supertest";
import api from "../api";

describe("Users API", () => {
  it("get users", async () => {
    const response = await request(api)
      .get(`/users`)
      .expect(200);

    expect(response.body.users.length).toBe(10);
  });
});
