class LoginPage {
    selectorsList() {   
        const selectors = {
            usernameField: "#username",
            passwordField: "#password",
            loginButton: "button",
            signinError: "[data-test=\"signin-error\"]",
            sidenavUsername: '[data-test="sidenav-username"]',
            sidenavSignout: '[data-test="sidenav-signout"]'

        }
        return selectors;
    }

    accessLoginPage() {
        cy.visit('/signin')
    }

    loginSucess(username, password) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().loginButton).click()
        cy.get(this.selectorsList().sidenavUsername, { timeout: 10000 }).should('be.visible').and('contain', username)
        cy.get(this.selectorsList().sidenavSignout).should('be.visible')
    }

    loginFailed(username, password) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().loginButton).click({ force: true })
        cy.get(this.selectorsList().signinError).contains('Username or password is invalid')
    }
}

export default new LoginPage()