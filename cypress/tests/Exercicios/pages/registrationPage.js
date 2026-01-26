class RegistrationPage {
    selectorsList() {
        const selectors = {
            usernameField: "#username",
            passwordField: "#password",
            loginButton: "button",
            signupButton: "[data-test=\"signup\"]",
            firstName: "#firstName",
            lastName: "#lastName",
            confirmPassword: "#confirmPassword"
        }
        return selectors;
    }

    accessRegistrationPage() {
        cy.visit('/signup')
    }

    loginValid(firstName, lastName, username, password, confirmPassword) {
        cy.get(this.selectorsList().signupButton).click( { force: true })
        cy.get(this.selectorsList().firstName).type(firstName)
        cy.get(this.selectorsList().lastName).type(lastName)
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().confirmPassword).type(confirmPassword)
        cy.get(this.selectorsList().loginButton).click()
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().loginButton).click() ({ force: true })
    }
    
    accessLoginPage() {
        cy.visit('/signin')
    }

    loginRequiredInfo(firstName, lastName) {
        cy.get(this.selectorsList().firstName).type(firstName)
        cy.get(this.selectorsList().lastName).type(lastName)    
        cy.get(this.selectorsList().usernameField).focus().blur()
        cy.get(this.selectorsList().passwordField).focus().blur()
        cy.get(this.selectorsList().confirmPassword).focus().blur()
        cy.get(this.selectorsList().loginButton).click()
    }
}

export default new RegistrationPage()