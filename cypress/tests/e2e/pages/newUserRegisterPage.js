class NewUserRegisterPage {

    selectorsList() {
        const selectorsList = {
            registerLink: "[data-test='signup']",
            firstNameField: "[name='firstName']",
            lastNameField: "[name='lastName']",
            userNameField: "[name='username']",
            passwordField: "[name='password']",
            confirmPasswordField: "[name='confirmPassword']",
            buttonSignUp: "[data-test='signup-submit']",
            wrongFirstName: "#firstName-helper-text",
            wrongLastName: "#lastName-helper-text",
            wrongUserName: "#username-helper-text",
            wrongPassword: "#password-helper-text",
            wrongConfirmPassword: "#confirmPassword-helper-text"
            
        }
        return selectorsList
    }

    accessLoginPage() {
        cy.visit('/signin')
    }

    registerLink() {
        cy.get(this.selectorsList().registerLink).click()
    }

    fillFirstName(firstName) {
        cy.get(this.selectorsList().firstNameField).click().type(firstName)
    }

    fillLastName(lastName) {
        cy.get(this.selectorsList().lastNameField).click().type(lastName)
    }

    fillUserName(userName) {
        cy.get(this.selectorsList().userNameField).click().type(userName)
    }

    fillPassword(password) {
        cy.get(this.selectorsList().passwordField).click().type(password)
    }
    fillConfirmPassword(confirmPassword) {
        cy.get(this.selectorsList().confirmPasswordField).click().type(confirmPassword)
    }

    validateRequiredFieldError(field) {
        const errors = {
            firstName: {
                field: this.selectorsList().firstNameField,
                selector: this.selectorsList().wrongFirstName,
                message: 'First Name is required'
            },
            lastName: {
                field: this.selectorsList().lastNameField,
                selector: this.selectorsList().wrongLastName,
                message: 'Last Name is required'
            },
            userName:{
                field: this.selectorsList().userNameField,
                selector: this.selectorsList().wrongUserName,
                message: 'Username is required'
            },
            password: {
                field: this.selectorsList().passwordField,
                selector: this.selectorsList().wrongPassword,
                message: 'Enter your password'
            },
            confirmPassword: {
                field: this.selectorsList().confirmPasswordField,
                selector: this.selectorsList().wrongConfirmPassword,
                message: 'Confirm your password'
            }
        }
        cy.get(errors[field].field).click({force: true}).blur()
        cy.get(errors[field].selector).should('contain', errors[field].message)
    }

    validateSignUpButton() {
    cy.get(this.selectorsList().buttonSignUp).then((button) => {
        const isDisabled = button.is(':disabled')
        if (!isDisabled) {
            cy.wrap(button).click()
        }})
    }

    //  clickSignUpButton() {
    //     cy.get(this.selectorsList().buttonSignUp).click({force: true})
    // }
}


export default NewUserRegisterPage