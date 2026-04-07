class OnboardingPage {
  selectors = {
    nextButton: "[data-test='user-onboarding-next']",
    bankName: '[name="bankName"]',
    routingNumber: '[name="routingNumber"]',
    accountNumber: '[name="accountNumber"]',
    submitButton: '[data-test="bankaccount-submit"]',
    doneButtonFallback: '[type="button"]'
    
  }

  clickNext() {
    cy.get(this.selectors.nextButton).click()
  }

  fillBankAccount(bank, routing, account) {
    cy.get(this.selectors.bankName).type(bank)
    cy.get(this.selectors.routingNumber).type(routing)
    cy.get(this.selectors.accountNumber).type(account)
  }

  submitBankAccount() {
    cy.get(this.selectors.submitButton).click()
  }

  finishOnboarding() {
    // workaround do botão Done
    cy.get(this.selectors.doneButtonFallback).eq(2).click()
  }
}

export default new OnboardingPage()