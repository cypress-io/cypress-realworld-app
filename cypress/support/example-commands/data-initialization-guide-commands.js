Cypress.Commands.add("createExampleTransaction", (transactionDetails) => {
  const { receiverId, transactionType } = transactionDetails;
  Cypress.log({
    name: "createTransaction",
    displayName: "Create Transaction",
    message: [`💰 ${receiverId} | ${transactionType}`],
  });

  return cy.task("db:createExampleTransaction", transactionDetails);
});

Cypress.Commands.add("addLikes", (transaction, users) => {
  Cypress.log({
    name: "addLikes",
    displayName: "ADD LIKES TO TRANSACTION",
    message: [`👩‍💼 Creating Likes for ${transaction.id}`],
    consoleProps() {
      return {
        transaction,
        users,
      };
    },
  });

  return cy.wrap(users).each((user) => {
    Cypress.log({ name: "user", displayName: "users", message: [`${user.id}`] });
    return cy.task("db:createLikeForTransaction", {
      userId: user.id,
      transactionId: transaction.id,
    });
  });
});

Cypress.Commands.add("addComments", (transaction, comments) => {
  Cypress.log({
    name: "addComments",
    displayName: "ADD COMMENTS TO TRANSACTION",
    message: [`👩‍💼 Creating Comments for ${transaction.id}`],
    consoleProps() {
      return {
        transaction,
        comments,
      };
    },
  });

  return cy.wrap(comments).each((comment) => {
    return cy.task("db:createCommentForTransaction", {
      transactionId: transaction.id,
      comment,
    });
  });
});

Cypress.Commands.add("createExampleUsers", (users) => {
  Cypress.log({
    name: "createExampleUsers",
    displayName: "CREATE EXAMPLE USERS",
    message: [`👩‍💼 Creating Users`],
  });

  return cy.wrap(users).each((userDetails) => {
    return cy.task("db:createUser", userDetails);
  });
});
