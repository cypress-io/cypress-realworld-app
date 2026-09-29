class TransferPage {

    selectorsList() {
        const selectorsList = {
            transferButtonNew: "[href='/transaction/new']",
            transferContact: "[data-test='user-list-item-_XblMqbuoP']",
            transferAmountField: "[name='amount']",
            transferDescriptionField: "[data-test='transaction-create-description-input']",
            transferPayButton: "[data-test='transaction-create-submit-payment']",
            transferSuccessMessage: "[data-test='sidenav']"
        }    
        return selectorsList
    } 

    acessTransferPage() {
        cy.get(this.selectorsList().transferButtonNew).click()
    }

    selectContactTransfer() {
        cy.get(this.selectorsList().transferContact).click()
    }

    paymentPage(value, description) {
        cy.get(this.selectorsList().transferAmountField).type(value)
        cy.get(this.selectorsList().transferDescriptionField).type(description)
        cy.get(this.selectorsList().transferPayButton).click()
    }

    checkTransferSuccessMessage() {
        cy.get(this.selectorsList().transferSuccessMessage).should('contain','Transaction Submitted!')
    }
}

export default TransferPage