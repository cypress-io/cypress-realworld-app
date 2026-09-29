class HistoricPage {

    selectorsList() {
        const selectorsList = {
            myHistoricButton: "[data-test='nav-personal-tab']",
            massageTransaction: "[data-test='empty-list-header'] > .MuiTypography-root",
            buttonTransaction: "[data-test='empty-list-children']",
            transactionsList: "[data-test='transaction-list']"
        }    
        return selectorsList
    }

    accessHistoricPage() {
        cy.get(this.selectorsList().myHistoricButton).click()
    }

    viewTransactionsList() {
        cy.get(this.selectorsList().transactionsList).should('have.length.greaterThan', 0)
    }

    noTransactionMessage() {
        cy.get(this.selectorsList().massageTransaction).should('contain','No Transactions')
        cy.get(this.selectorsList().buttonTransaction).should('be.visible')
    }
}

export default HistoricPage