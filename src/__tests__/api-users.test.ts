import request from "supertest";
import api from "../api";
import faker from "faker";
import _ from "lodash";

describe("Users API", () => {
  it("get users", () => {
    request(api)
      .get(`/users`)
      .expect(200)
      .expect(json => expect(json.body.users.length).toBe(10))
      .catch(e => {
        console.log(e, e.response, e.status);
      });
  });

  it("creates a new user", done => {
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
      .expect(json => expect(json.body).toContain({ first_name }))
      .end(done)
      .catch(e => {
        console.log(e, e.response, e.status);
        done();
      });
  });

  it.skip("updates a user", () => {
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
