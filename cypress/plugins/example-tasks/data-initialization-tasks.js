import shortid from "shortid";
import { createTransaction, createLike, createComment } from "../../../backend/database";

const tasks = {
  "db:seed:django"() {
    return cy.exec("django-admin loaddata users-fixture.json transactions-fixture.json");
  },
  "db:seed:sequelize"() {
    return cy.exec("sequelize db:seed:all");
  },
  "db:seed:mongo"() {
    return cy.exec("mongoimport --db=app --collection=users --file=seedUsers.json");
  },
  "db:createUser"(userDetails) {
    const {
      id,
      firstName,
      lastName,
      username,
      password,
      email,
      createdAt,
      modifiedAt,
    } = userDetails;
    const userId = id ? id : shortid();

    // eslint-disable-next-line no-undef
    return sequelize.query(
      "INSERT INTO users (id, firstName, lastName, username, password, email, createdAt, modifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
      {
        replacements: [
          userId,
          firstName,
          lastName,
          username,
          password,
          email,
          createdAt,
          modifiedAt,
        ],
      }
    );
  },
  "db:getUsers"(userCount) {
    // eslint-disable-next-line no-undef
    return sequelize.query("SELECT * FROM users LIMIT ?;");
  },
  "db:createUser:python"(userDetails) {
    // Python
    return cy.exec("python database.py —create user");
  },
  "db:createUser:ruby"(userDetails) {
    // Ruby
    return cy.exec("ruby database.rb —create user");
  },
  "db:createExampleTransaction"(transactionDetails) {
    const { senderId, transactionType } = transactionDetails;
    return createTransaction(senderId, transactionType, transactionDetails);
  },
  "db:createLikeForTransaction"(userId, transactionId) {
    return createLike(userId, transactionId);
  },
  "db:createCommentForTransaction"(userId, transactionId, content) {
    return createComment(userId, transactionId, content);
  },
};

function registerDataInitializationTasks(on, config) {
  on("task", tasks);

  return config;
}

module.exports = registerDataInitializationTasks;
