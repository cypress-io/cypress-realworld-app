class TransactionPage {
  selectors = {
    newButton: "[href='/transaction/new']",
    userListItem: "[data-test^='user-list-item-']",
    valueField: "input[name='amount']",
    noteField: "[placeholder='Add a note']",
    payButton: "[data-test='transaction-create-submit-payment']",
    balanceValue: "[data-test='sidenav-user-balance']",
    successAlert: "[data-test='alert-bar-success']"
    
  }

  openNewTransaction() {
    cy.get(this.selectors.newButton).should('be.visible').click()
    cy.get(this.selectors.userListItem).should('have.length.greaterThan', 0)
  }

  selectUserById(userId) {
    cy.get(`[data-test='user-list-item-${userId}']`)
      .scrollIntoView()
      .should('be.visible')
      .click()
  }

  sendMoney(amount, note, userId) {
    this.openNewTransaction()
    this.selectUserById(userId)
    cy.get(this.selectors.valueField).should('be.visible').type(amount)
    cy.get(this.selectors.noteField).should('be.visible').type(note)
    cy.get(this.selectors.payButton).should('be.visible').click()
  }

  checkBalance() {
    return cy.get(this.selectors.balanceValue)
  }

  checkSuccessAlert() {
    return cy.get(this.selectors.successAlert)
  }
}

export default new TransactionPage()