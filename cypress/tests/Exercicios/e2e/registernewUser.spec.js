  import userData from '../fixtures/userData.json'
  import registrationPage from '../pages/registrationpage.js'

  describe('register user', () => {

   it('Login - Valid', () => {
        cy.visit('/signup')
        cy.get(registrationPage.selectorsList().firstName).type(userData.userValid.firstName)
        cy.get(registrationPage.selectorsList().lastName).type(userData.userValid.lastName)
        cy.get(registrationPage.selectorsList().usernameField).type(userData.userValid.username)
        cy.get(registrationPage.selectorsList().passwordField).type(userData.userValid.password)
        cy.get(registrationPage.selectorsList().confirmPassword).type(userData.userValid.confirmPassword)
        cy.get(registrationPage.selectorsList().loginButton).click({ force: true })
        cy.get(registrationPage.selectorsList().usernameField).type(userData.userValid.username)
        cy.get(registrationPage.selectorsList().passwordField).type(userData.userValid.password)
        cy.get(registrationPage.selectorsList().loginButton).click({ force: true })
        cy.pause()
        // Automação do Caso de Teste: Registro de novo usuário com sucesso.
  })

   it('Login - Required information', () => {
        cy.visit('/signin')
        cy.get(registrationPage.selectorsList().signupButton).click({ force: true })
        cy.get(registrationPage.selectorsList().firstName).type(userData.incompleteUserdata.firstName)
        cy.get(registrationPage.selectorsList().lastName).type(userData.incompleteUserdata.lastName)    
        cy.get(registrationPage.selectorsList().usernameField).focus().blur()
        cy.get(registrationPage.selectorsList().passwordField).focus().blur()
        cy.get(registrationPage.selectorsList().confirmPassword).focus().blur()
        cy.get(registrationPage.selectorsList().loginButton).click({ force: true })
        // Automação do Caso de Teste: Tentar registrar um novo usuário com informações incompletas.
  })
})
