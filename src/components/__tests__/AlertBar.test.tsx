/// <reference types="cypress"/>

import React from "react";
import { mount } from "@cypress/react";
import AlertBar from "../AlertBar";

describe("smoke", () => {
  it("works", () => {
    expect(true).to.eq(true);
  });
});
