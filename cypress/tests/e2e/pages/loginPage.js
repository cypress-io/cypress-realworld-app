class LoginPage {

    selectorsList() {
        const selectorsList = {
            usernameField: "[name='username']",
            passwordField: "[type='password']",
            loginButton: "[data-test='signin-submit']",
            wrongCredentialsError: "[data-test='signin-error']"

        }
        return selectorsList
    }

    accessLoginPage() {
        cy.visit('/signin')
    }

    loginUser(username, password) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().loginButton).click()
    }

    checkWrongCredentialsError() {
        cy.get(this.selectorsList().wrongCredentialsError).should('contain','Username or password is invalid')
    }
}

export default LoginPage