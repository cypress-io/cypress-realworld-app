describe('Registro de novo usuário com sucesso', () => {
  it.skip('Deve registrar um novo usuário com informações válidas', () => {
    // Implemente os passos do caso de teste aqui

    cy.visit('http://localhost:3000/signin')
    cy.get('[data-test="signup"]').click()
    cy.get('[name="firstName"]').type('Robert')
    cy.get('[name="lastName"]').type('Souza')
    cy.get('[name="username"]').type('RS')
    cy.get('[name="password"]').type('12345')
    cy.get('[name="confirmPassword"]').type('12345')
    cy.get('[data-test="signup-submit"]').click()

  });
});
describe('Tentar registrar um novo usuário com informações incompletas', () => {
  it('Deve exibir mensagens de erro ao tentar registrar um novo usuário sem preencher todas as informações obrigatórias', () => {
    // Implemente os passos do caso de teste aqui

    cy.visit('http://localhost:3000/signin')
    cy.get('[data-test="signup"]').click()
    cy.get('[name="firstName"]').click()
    cy.get('[name="lastName"]').click()
    cy.get('[id="firstName-helper-text"]')
    cy.get('[name="username"]').click()
    cy.get('[id="lastName-helper-text"]')
    cy.get('[name="password"]').click()
    cy.get('[id="username-helper-text"]')
    cy.get('[name="confirmPassword"]').click()
    cy.get('[id="password-helper-text"]')
    cy.get('[name="firstName"]').click()
    cy.get('[id="confirmPassword-helper-text"]')
  });
});

