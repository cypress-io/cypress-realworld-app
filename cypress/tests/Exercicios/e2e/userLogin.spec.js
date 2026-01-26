import userData from '../fixtures/userData.json'
import loginPage from '../pages/loginPage.js'

describe('User Login', () => {

  it('Login - Sucess', () => {
    cy.visit('/signin')
    cy.get(loginPage.selectorsList().usernameField).type(userData.userSucess.username)
    cy.get(loginPage.selectorsList().passwordField).type(userData.userSucess.password)
    cy.get(loginPage.selectorsList().loginButton).click()
    cy.get(loginPage.selectorsList().sidenavUsername, { timeout: 10000 }).should('be.visible').and('contain', userData.userSucess.username)
    cy.get(loginPage.selectorsList().sidenavSignout).should('be.visible')
    cy.pause()
   //Automação do Caso de Teste: Login com sucesso.
  })

  it('Login - Failed', () => {
    cy.visit('/signin')
    cy.get(loginPage.selectorsList().usernameField).type(userData.userFailed.username)
    cy.get(loginPage.selectorsList().passwordField).type(userData.userFailed.password)
    cy.get(loginPage.selectorsList().loginButton).click({ force: true })
    cy.get(loginPage.selectorsList().signinError)
    //Automação do Caso de Teste: Tentar fazer login com credenciais inválidas.
  })

})
