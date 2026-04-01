import registerPage from '../../pages/registerPage'

describe('Registro', () => {
  it('Deve registrar um novo usuário com sucesso', () => {
    const username = `user${Date.now()}`
    registerPage.accessRegisterPage()
    registerPage.registerUser('Luiz', 'Teste', username, 's3cret')

    cy.url().should('not.include', '/signup')
  })

  it('Deve exibir mensagens de erro ao tentar registrar um novo usuário sem preencher todas as informações obrigatórias', () => {
    registerPage.accessRegisterPage()

    cy.get("[name='lastName']").type('Teste')
    cy.get("[name='username']").type(`user${Date.now()}`)
    cy.get("[name='password']").type('s3cret')
    cy.get("[name='confirmPassword']").type('s3cret')

    cy.get("[type='submit']").should('be.disabled')
    cy.contains('First Name is required').should('be.visible')
  })
})