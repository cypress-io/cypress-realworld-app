Cypress.Commands.add(
  "createTransaction",
  (sender, receiver, transactionType, transactionDetails) => {
    Cypress.log({
      name: "createTransaction",
      displayName: "Create Transaction",
      message: [`💰 ${receiver.id} | ${transactionType}`],
    });

    transactionDetails.sender = sender;
    transactionDetails.reciever = receiver;

    return cy.task("db:createTransaction", [sender, transactionType, transactionDetails]);
  }
);

Cypress.Commands.add("addLikes", (transaction, users) => {
  Cypress.log({
    name: "addLikes",
    displayName: "ADD LIKES TO TRANSACTION",
    message: [`👩‍💼 Creating Likes for ${transaction.id}`],
  });

  return cy.wrap(users).each((user) => {
    return cy.task("db:createLikeForTransaction", [user.id, transaction.id]);
  });
});

Cypress.Commands.add("addComments", (transaction, comments) => {
  Cypress.log({
    name: "addComments",
    displayName: "ADD COMMENTS TO TRANSACTION",
    message: [`👩‍💼 Creating Comments for ${transaction.id}`],
  });

  return cy.wrap(comments).each((comment) => {
    return cy.task("db:createCommentForTransaction", [
      comment.user.id,
      transaction.id,
      comment.content,
    ]);
  });
});
