class TransferPage {
    selectorsList() {
        const selectors = {
            usernameField: '[name="username"]',
            passwordField: '[name="password"]',
            signinButton: ".SignInForm-submit",
        }
        return selectors
    }

    accessLoginPage() {
        cy.visit('http://localhost:3000/signin')
    }

    login(username, password){
        cy.get('[name="username"]').type(username)
        cy.get('[name="password"]').type(password)
        cy.get('[data-test="signin-submit"]').click()
    
    }

    sendMoney(value, msg){
        cy.get('[data-test="nav-top-new-transaction"]').click()
        cy.get('[data-test="user-list-item-_XblMqbuoP"]').click()
        cy.get('[name="amount"]').type(value)
        cy.get('.MuiInputBase-root > [name="description"]').type(msg)
        cy.get('[data-test="transaction-create-submit-payment"]').click()
        cy.get('[data-test="alert-bar-success"]').should('contain.text', 'Transaction Submitted!');
        cy.get('[data-test="new-transaction-return-to-transactions"]').click()
    }

    sendMoneyNoMoney(value, msg){
        cy.get('[data-test="nav-top-new-transaction"]').click()
        cy.get('[data-test="user-list-item-uBmeaz5pX"]').click()
        cy.get('[name="amount"]').type(value)
        cy.get('.MuiInputBase-root > [name="description"]').type(msg)
        cy.get('[data-test="transaction-create-submit-payment"]').click()
        cy.get('[data-test="alert-bar-failed"]').should('contain.text', 'Transaction Declined!');

    }
}

export default TransferPage