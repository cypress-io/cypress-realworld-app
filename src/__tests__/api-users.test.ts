import request from "supertest";
import api from "../api";
import faker from "faker";
import _ from "lodash";

describe("GET /users", () => {
  it("should retrieve a list of users", async done => {
    const resp = await request(api).get(`/users`);

    expect(resp.status).toBe(200);
    expect(resp.body.users.length).toBe(10);
    done();
  });
});

describe("POST /users", () => {
  it("should create a new user", async done => {
    const first_name = faker.name.firstName();
    const response = await request(api)
      .post(`/users`)
      .send({
        first_name,
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        phone_number: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar()
      });

    expect(response.body.toContain({ first_name }));
    done();
  });
});

describe("PATCH /users", () => {
  it.skip("should update a user", () => {
    const first_name = faker.name.firstName();

    request(api)
      .get(`/users`)
      .expect(404);
    //.expect(json => expect(json.body).toContain({ first_name }));
    //.then(users => {
    //const user_id = _.first(users);
    //console.log("users", users);

    /*request(api)
          .patch(`/users/${user_id}`)
          .send({
            first_name
          })
          .expect(204)
          .expect(json => expect(json.body).toContain({ first_name }));*/
    //});
  });
});
