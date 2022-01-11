import * as React from "react";
import { mount } from "@cypress/react";
import { interpret } from "xstate";
import AlertBar from "./AlertBar";
import { snackbarMachine } from "../machines/snackbarMachine";

describe("Alert Bar with state", () => {
  let snackbarService;
  beforeEach(() => {
    snackbarService = interpret(snackbarMachine);
    snackbarService.start();

    expect(snackbarService.state.value).to.equal("invisible");
  });
  it("Alert Bar shows success message", () => {
    const payload = { type: "SHOW", severity: "success", message: "Test Message" };
    snackbarService.send(payload);
    expect(snackbarService.state.value).to.equal("visible");

    mount(<AlertBar snackbarService={snackbarService} />);
    cy.get("[data-test*=alert-bar]")
      .should("contain", payload.message)
      .and("have.class", "MuiAlert-filledSuccess");
  });
});
