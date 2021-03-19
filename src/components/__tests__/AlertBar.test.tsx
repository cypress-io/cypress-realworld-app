/// <reference types="cypress"/>

import React from "react";
import ReactDom from "react-dom";
import { mount } from "@cypress/react";
import { snackbarMachine } from "../../machines/snackbarMachine";
import { useMachine } from '@xstate/react'

import AlertBar from "../AlertBar";

describe("smoke", () => {
  it("works", () => {
    const [, , snackbarService] = useMachine(snackbarMachine);    
    mount(<AlertBar snackbarService={snackbarService} />, { ReactDom });
    // This works fine! :-(
    // mount(<button>Hello world!</button>);
  });
});
