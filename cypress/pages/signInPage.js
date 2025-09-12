class SignInPage {
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

    loginSucces(username, password) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().signinButton).click()
        cy.get('[data-test="sidenav-home"]').contains('Home')

        cy.get('[data-test="sidenav-signout"]').click()
        cy.location('pathname').should('equal', '/signin')
        cy.get(this.selectorsList().usernameField).should('have.value', '')
        cy.get(this.selectorsList().passwordField).should('have.value', '')
    }


    loginSuccesBox(username, password) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get('[name="remember"]').click()
        cy.get(this.selectorsList().signinButton).click()
        cy.get('[data-test="sidenav-home"]').contains('Home')

        cy.get('[data-test="sidenav-signout"]').click()
        cy.location('pathname').should('equal', '/signin')
        cy.get(this.selectorsList().usernameField).should('admin')
        cy.get(this.selectorsList().passwordField).should('1234')


    }

    signinIncUser(username, password){
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().signinButton).click()
        cy.get('[data-test="signin-error"]').should('exist')
    }
    signinIncPass(username, password){
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().signinButton).click()
        cy.get('[data-test="signin-error"]').should('exist')
    }

    signinEmptyPass(username){
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).click()
        
        cy.get(this.selectorsList().signinButton).should('be.disabled')
        cy.get(this.selectorsList().usernameField).clear()

    }

    signinEmptyUser(password){
        cy.get(this.selectorsList().usernameField).click()
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().signinButton).should('be.disabled')

        cy.get('#username-helper-text').should('exist')
        cy.get(this.selectorsList().passwordField).clear()

    }

    signinEmpty(){
        cy.get(this.selectorsList().usernameField).click()
        cy.get(this.selectorsList().passwordField).click()
        cy.get(this.selectorsList().signinButton).should('be.disabled')
    }

}

export default SignInPage