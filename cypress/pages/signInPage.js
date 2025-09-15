class SignInPage {
    selectorsList() {
        const selectors = {
            usernameField: '[name="username"]',
            passwordField: '[name="password"]',
            signinButton: ".SignInForm-submit",
            firsTitllePopup: "[data-test='user-onboarding-dialog-title'])",
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

        cy.wait(1000); // opcional, se o pop-up demora para renderizar

        cy.get('body').then(($body) => {
            const $popup = $body.find('.MuiPaper-elevation24:visible');

            if ($popup.length > 0) {
                cy.log('Pop-up apareceu!');
                cy.get('[data-test="user-onboarding-next"]').click()
                cy.get('[name="bankName"]').type('NuBanck')
                cy.get('[name="routingNumber"]').type('123456789')
                cy.get('[name="accountNumber"]').type('987654321')
                cy.get('[data-test="bankaccount-submit"]').click()
                cy.get('[data-test="user-onboarding-next"]').click()

            } else {
                cy.log('ℹPop-up não apareceu, seguindo fluxo normal');
                cy.get('[data-test="sidenav-signout"]').click()

            }
        });
    }

    loginSuccesBox(username, password) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get('[name="remember"]').click()
        cy.get(this.selectorsList().signinButton).click()
        cy.get('[data-test="sidenav-home"]').contains('Home')

        cy.get('[data-test="sidenav-signout"]').click()
        cy.location('pathname').should('equal', '/signin')
        cy.get(this.selectorsList().usernameField)
            .should('have.value', '');

        cy.get(this.selectorsList().passwordField)
            .should('have.value', '');


    }

    signinIncUser(username, password) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().signinButton).click()
        cy.get('[data-test="signin-error"]').should('exist')
    }
    signinIncPass(username, password) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().signinButton).click()
        cy.get('[data-test="signin-error"]').should('exist')
    }

    signinEmptyPass(username) {
        cy.get(this.selectorsList().usernameField).type(username)
        cy.get(this.selectorsList().passwordField).click()

        cy.get(this.selectorsList().signinButton).should('be.disabled')
        cy.get(this.selectorsList().usernameField).clear()

    }

    signinEmptyUser(password) {
        cy.get(this.selectorsList().usernameField).click()
        cy.get(this.selectorsList().passwordField).type(password)
        cy.get(this.selectorsList().signinButton).should('be.disabled')

        cy.get('#username-helper-text').should('exist')
        cy.get(this.selectorsList().passwordField).clear()

    }

    signinEmpty() {
        cy.get(this.selectorsList().usernameField).click()
        cy.get(this.selectorsList().passwordField).click()
        cy.get(this.selectorsList().signinButton).should('be.disabled')
    }

}

export default SignInPage