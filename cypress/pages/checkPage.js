class CheckPage {
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

    history(){
        cy.get('[data-test="nav-personal-tab"]').click()
        cy.get('.TransactionAmount-amountNegative').should('be.visible')
    }

    historyEmpty(){
        cy.get('[data-test="nav-personal-tab"]').click()
        cy.get('[data-test="empty-list-header"] > .MuiTypography-root').should('contain.text', 'No Transactions');
    }

}

export default CheckPage