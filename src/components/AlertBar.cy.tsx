import { startCase } from "lodash";
import { mount } from "@cypress/react";
import { interpret } from "xstate";
import AlertBar from "./AlertBar";
import { Severities, snackbarMachine } from "../machines/snackbarMachine";

describe("Alert Bar with state", () => {
  const SeverityValues = Object.values(Severities);
  let snackbarService;
  beforeEach(() => {
    snackbarService = interpret(snackbarMachine);
    snackbarService.start();

    expect(snackbarService.state.value).to.equal("invisible");
  });

  SeverityValues.forEach((severity) => {
    it(`Alert Bar shows ${severity} message`, () => {
      const payload = { type: "SHOW", severity, message: "Test Message" };
      snackbarService.send(payload);
      expect(snackbarService.state.value).to.equal("visible");

      mount(<AlertBar snackbarService={snackbarService} />);
      cy.get("[data-test*=alert-bar]")
        .should("contain", payload.message)
        .and("have.class", `MuiAlert-filled${startCase(severity)}`);
    });
  });
});
