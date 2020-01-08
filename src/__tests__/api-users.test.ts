import request from "supertest";
import api from "../api";
import faker from "faker";

/*
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
*/

// Variation (return)
/*
describe("GET /users", () => {
  it("should retrieve a list of users", () => {
    return request(api) // without return, if expect is 201 status code may not fail
      .get(`/users`)
      .expect(200) // change to 201 to demostrate Jest looping cycle after failure
      .expect(json => json.body.users.length === 10);
  });
});

describe("POST /users", () => {
  it("should create a new user", () => {
    const first_name = faker.name.firstName();
    return request(api) // without return will report false-positive if status code is changed
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
      .expect(201) // without return, when changed to 400 reports false-positive
      .expect(json => expect(json.body.user).toContain({ first_name })); // any failure is reported, but Jest continues to loop over
  });
});
*/

// Variation (done)
/*
describe("GET /users", () => {
  it("should retrieve a list of users", done => {
    request(api)
      .get(`/users`)
      .expect(200) // change to 201 and reports false-positive
      .expect(json => json.body.users.length === 10);
    //.then(done); // reports jest failure, github issues report this to be the choice over .end()
    //.end(done); // discouraged from using via docs, but allows the test to pass
    done(); // reports success
  });
});

describe("POST /users", () => {
  it("should create a new user", done => {
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
      .expect(201) // change to 204 and reports false-positive
      .expect(json => expect((json.body.user.first_name = first_name)));
    //.then(done); // reports success, but jest continues to loop over passing test suite
    //.then(() => done()); // variation, reports success, but jest continues to loop over passing test suite
    //.end(done); // creates jest loop even though test passes
    done(); // reports success
  });
});
*/
