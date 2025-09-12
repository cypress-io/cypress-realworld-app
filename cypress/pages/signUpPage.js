class NewAccPage {
    selectorsList() {
        const selectors = {
            signupCreate: '[data-test="signup-submit"]',
            firstNameField: '[name="firstName"]',
            lastNameField: '[name="lastName"]',
            userNameField: '[name="username"]',
            passwordField: '[name="password"]',
            confirmPasswordField: '[name="confirmPassword"]',
            signupButton: '[data-test="signup"]'
        }
        return selectors
    }

    accessLoginPage() {
        cy.visit('http://localhost:3000/signin')
    }

    // Test Case - Create Account 
    createAcc(name, lastName, userName, password, confirmPassword) {
        cy.get(this.selectorsList().signupButton).click()
        cy.get(this.selectorsList().firstNameField).type(name)
        cy.get(this.selectorsList().lastNameField).type(lastName)
        cy.get(this.selectorsList().userNameField).type(userName)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().confirmPasswordField).type(confirmPassword)
        cy.get(this.selectorsList().signupCreate).click()

    }

    successCreate() {
        cy.location('pathname').should('equal', '/signin')
    }

    // Test Case - Create Account with fields empty
    createEmptyName(lastName, userName, password, confirmPassword) {
        cy.visit('http://localhost:3000/signin')
        cy.get(this.selectorsList().signupButton).click()
        cy.get(this.selectorsList().lastNameField).type(lastName)
        cy.get(this.selectorsList().userNameField).type(userName)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().confirmPasswordField).type(confirmPassword)
        cy.get(this.selectorsList().signupCreate).should('be.disabled')
        cy.get('#firstName-helper-text').should('exist')
    }

    createEmptyLastName(name, userName, password, confirmPassword) {
        cy.visit('http://localhost:3000/signin')
        cy.get(this.selectorsList().signupButton).click()
        cy.get(this.selectorsList().firstNameField).type(name)
        cy.get(this.selectorsList().lastNameField).click()
        cy.get(this.selectorsList().userNameField).type(userName)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().confirmPasswordField).type(confirmPassword)
        cy.get(this.selectorsList().signupCreate).should('be.disabled')
        cy.get('#lastName-helper-text').should('exist')
    }

    createEmptyUserName(name, lastName, password, confirmPassword) {
        cy.visit('http://localhost:3000/signin')
        cy.get(this.selectorsList().signupButton).click()
        cy.get(this.selectorsList().firstNameField).type(name)
        cy.get(this.selectorsList().lastNameField).type(lastName)
        cy.get(this.selectorsList().userNameField).click()
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().confirmPasswordField).type(confirmPassword)
        cy.get(this.selectorsList().signupCreate).should('be.disabled')
        cy.get('#username-helper-text').should('exist')
    }

    createEmptyPassword(name, lastName, userName, confirmPassword) {
        cy.visit('http://localhost:3000/signin')
        cy.get(this.selectorsList().signupButton).click()
        cy.get(this.selectorsList().firstNameField).type(name)
        cy.get(this.selectorsList().lastNameField).type(lastName)
        cy.get(this.selectorsList().userNameField).type(userName)
        cy.get(this.selectorsList().passwordField).click()
        cy.get(this.selectorsList().confirmPasswordField).type(confirmPassword)
        cy.get(this.selectorsList().signupCreate).should('be.disabled')
        cy.get('#password-helper-text').should('exist')
    }

    createEmptyConfirmPassword(name, lastName, userName, password) {
        cy.visit('http://localhost:3000/signin')
        cy.get(this.selectorsList().signupButton).click()
        cy.get(this.selectorsList().firstNameField).type(name)
        cy.get(this.selectorsList().lastNameField).type(lastName)
        cy.get(this.selectorsList().userNameField).type(userName)
        cy.get(this.selectorsList().confirmPasswordField).click()
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().signupCreate).should('be.disabled')
        cy.get('#confirmPassword-helper-text').should('exist')
    }

    createEmptyAll() {
        cy.visit('http://localhost:3000/signin')
        cy.get(this.selectorsList().signupButton).click()
        cy.get(this.selectorsList().firstNameField).click()
        cy.get(this.selectorsList().lastNameField).click()
        cy.get(this.selectorsList().userNameField).click()
        cy.get(this.selectorsList().passwordField).click()
        cy.get(this.selectorsList().confirmPasswordField).click()
        cy.get(this.selectorsList().signupCreate).should('be.disabled')

    }

    createDiffPass(name, lastName, userName, password, confirmPassword) {
        cy.visit('http://localhost:3000/signin')
        cy.get(this.selectorsList().signupButton).click()
        cy.get(this.selectorsList().firstNameField).type(name)
        cy.get(this.selectorsList().lastNameField).type(lastName)
        cy.get(this.selectorsList().userNameField).type(userName)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().confirmPasswordField).type(confirmPassword)
        cy.get(this.selectorsList().signupCreate).should('be.disabled')
        cy.get('#confirmPassword-helper-text').should('exist')
    }




}

export default NewAccPage