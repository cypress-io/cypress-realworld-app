import { User } from "../../../src/models";

type NewTransactionTestCtx = {
  allUsers?: User[];
  user?: User;
  contact?: User;
};

describe("searches for a user by attribute", function () {
  const ctx: NewTransactionTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();

    cy.route("GET", "/users").as("allUsers");
    cy.route("GET", "/users/search*").as("usersSearch");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.allUsers = users;
      ctx.user = users[0];
      ctx.contact = users[1];

      return cy.loginByXstate(ctx.user.username);
    });
  });

  const searchAttrs: (keyof User)[] = ["firstName", "lastName", "username", "email", "phoneNumber"];

  beforeEach(function () {
    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");
  });

  searchAttrs.forEach((attr: keyof User) => {
    it(attr, function () {
      const targetUser = ctx.allUsers![2];

      cy.log(`Searching by **${attr}**`);
      cy.getBySel("user-list-search-input").type(targetUser[attr] as string, { force: true });
      cy.wait("@usersSearch")
        // make sure the backend returns some results
        .its("responseBody.results.length")
        .should("be.gt", 0)
        .then((resultsN) => {
          cy.getBySelLike("user-list-item")
            // make sure the list of results is fully updated
            // and shows the number of results returned from the backend
            .should("have.length", resultsN)
            .first()
            .contains(targetUser[attr] as string);
        });

      cy.visualSnapshot(`User List for Search: ${attr} = ${targetUser[attr]}`);

      cy.focused().clear();
      cy.getBySel("users-list").should("be.empty");
      cy.visualSnapshot("User List Clear Search");
    });
  });
});
