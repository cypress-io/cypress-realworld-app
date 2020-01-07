import request from "supertest";
import api from "../api";

describe("API", () => {
  it("gets transactions", async () => {
    const response = await request(api)
      .get(`/transactions`)
      .expect(200);

    expect(response.body).toBeDefined();
  });
});
