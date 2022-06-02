import { mount } from "@cypress/react";
import { MemoryRouter } from "react-router-dom";
import TransactionsContainer from "./TransactionsContainer";

describe("Transactions Container", () => {
  it("should not render transactions", () => {
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <TransactionsContainer />
      </MemoryRouter>
    );
    cy.get("[data-test*=empty-list-header]").should("exist");
  });
  it("should render public transactions", () => {
    cy.intercept("http://localhost:3001/transactions/*", {
      fixture: "public-transactions.json",
    });
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <TransactionsContainer />
      </MemoryRouter>
    );
    cy.get("[data-test*=empty-list-header]").should("not.exist");
    cy.get(".MuiListSubheader-root").should("contain", "Public");
  });
  it("should render contacts transactions", () => {
    cy.intercept("http://localhost:3001/transactions/*", {
      fixture: "public-transactions.json",
    });
    mount(
      <MemoryRouter initialEntries={["/contacts"]}>
        <TransactionsContainer />
      </MemoryRouter>
    );
    cy.get("[data-test*=empty-list-header]").should("not.exist");
    cy.get(".MuiListSubheader-root").should("contain", "Contacts");
  });
  it("should render personal transactions", () => {
    cy.intercept("http://localhost:3001/transactions/*", {
      fixture: "public-transactions.json",
    });
    mount(
      <MemoryRouter initialEntries={["/personal"]}>
        <TransactionsContainer />
      </MemoryRouter>
    );
    cy.get("[data-test*=empty-list-header]").should("not.exist");
    cy.get(".MuiListSubheader-root").should("contain", "Personal");
  });
});
