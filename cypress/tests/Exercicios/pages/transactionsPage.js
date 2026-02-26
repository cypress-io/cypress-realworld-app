class TransactionsPage {

  selectorsList() {
    return {
      accessAbaTransacoes: '[data-test="nav-personal-tab"]',
      validatePaginaTransacoes: '[data-test="main"]',
      changeDataTransacoes: '[data-test="transaction-list-filter-date-range-button"]',
      currentDay: ".react-calendar__tile--now",
      msgNoTransactions: "[data-test='empty-list-header']"
    }
  }

  successfullyTransaction() {
    cy.get(this.selectorsList().accessAbaTransacoes).click()
    cy.contains(this.selectorsList().validatePaginaTransacoes,'Personal').should('be.visible')
    
  }

  unsuccessfulTransaction() {
   
    cy.get(this.selectorsList().accessAbaTransacoes).click()
    cy.get(this.selectorsList().changeDataTransacoes).click({force: true})
    cy.get(this.selectorsList().currentDay).click({force: true})
    cy.get(this.selectorsList().currentDay).click({force: true})
    cy.contains(this.selectorsList().msgNoTransactions, 'No Transactions').should('be.visible')

  }

}

export default new TransactionsPage()