class TransactionPage {
  selectors = {
    newButton: "[href='/transaction/new']",
    sendClient: "[data-test='user-list-item-WHjJ4qR2R2']",
    valueField: "input[name='amount']",
    noteField: "[placeholder='Add a note']",
    payButton: "[data-test='transaction-create-submit-payment']",
    balanceValue: "[data-test='sidenav-user-balance']",
    successAlert: "[data-test='alert-bar-success']"
  }

  sendMoney() {
    cy.get(this.selectors.newButton).click()
    cy.get(this.selectors.sendClient).click()
    cy.get(this.selectors.valueField).type("100")
    cy.get(this.selectors.noteField).type("payment meat")
    cy.get(this.selectors.payButton).click()
  }

  insufficientBalanceTransaction() {
    cy.get(this.selectors.newButton).click()
    cy.get(this.selectors.sendClient).click()
    cy.get(this.selectors.valueField).type("40000000")
    cy.get(this.selectors.noteField).type("teste saldo insuficiente")
    cy.get(this.selectors.payButton).click()
  }

  checkBalance() {
    return cy.get(this.selectors.balanceValue)
  }

  checkSuccessAlert() {
    return cy.get(this.selectors.successAlert)
  }
}

export default new TransactionPage()