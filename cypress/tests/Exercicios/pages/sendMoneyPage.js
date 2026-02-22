class SendMoneyPage {
  selectors() {
    return {
      newTransaction: '[data-test="nav-top-new-transaction"]',
      usersListItem: '[data-test="users-list"] li',
      amountInput: '[data-test="transaction-create-amount-input"] input',
      descriptionInput: '[data-test="transaction-create-description-input"] input',
      submitButton: '[data-test="transaction-create-submit-payment"]',
      successAlert: '[data-test="alert-bar-success"]'
    }
  }

  moneySuccessfully() {
  cy.get(this.selectors().newTransaction).click()
  cy.get(this.selectors().usersListItem).first().click()
  cy.get(this.selectors().amountInput).clear().type('50')
  cy.get(this.selectors().descriptionInput).clear().type('Payment for services')
  cy.get(this.selectors().submitButton).should('be.enabled').click()
  cy.url().should('include', '/transaction')
}

  insufficientBalance() {
    cy.get(this.selectors().newTransaction).click()
    cy.get(this.selectors().usersListItem).first().click()
    cy.get(this.selectors().amountInput).clear().type('50000')
    cy.get(this.selectors().descriptionInput).clear().type('Payment for services')
    cy.get(this.selectors().submitButton).click()
    cy.url().should('include', '/transaction/new')
  }

}

export default new SendMoneyPage()