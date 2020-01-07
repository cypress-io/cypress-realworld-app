import request from "supertest";
import api from "../api";
import faker from "faker";

describe("Users API", () => {
  it("get users", () => {
    request(api)
      .get(`/users`)
      .expect(200)
      .expect(json => expect(json.body.users.length).toBe(10));
  });

  it("creates a new user", () => {
    const first_name = faker.name.firstName();
    request(api)
      .post(`/users`)
      .send({
        first_name,
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        phone_number: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar()
      })
      .expect(201)
      .expect(json => expect(json.body).toContain({ first_name }));
  });
});
