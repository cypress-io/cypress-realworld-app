describe('Fluxo Completo - Cadastro, Login e Criação de Conta Bancária', () => {
  // Mapeamento centralizado de seletores
  const selectors = {
    // Cadastro
    signupLink: "[data-test='signup']",
    firstNameField: "[name='firstName']",
    lastNameField: "[name='lastName']",
    usernameField: "[name='username']",
    passwordField: "[name='password']",
    confirmPasswordField: "[name='confirmPassword']",
    signupSubmitButton: "[data-test='signup-submit']",
    newTransactionButton: "[data-test='nav-top-new-transaction']",
    searchField: "[data-test='user-list-search-input']",
    contact: "[data-test*='user-list-item']",
    amountField: "[name='amount']",
    descriptionField: "[placeholder='Add a note']",
    payButton: "[data-test='transaction-create-submit-payment']",
    homePage: "[data-test='sidenav-home']",
    minePage: "[data-test='nav-personal-tab']",
    friendPage: "[data-test='nav-contacts-tab']",
    
    // Login
    rememberCheckbox: "[type='checkbox']",
    loginButton: "[type='submit']",
    
    // Onboarding Bancário
    nextButton: "[data-test='user-onboarding-next']",
    bankNameField: "[placeholder='Bank Name']",
    routingNumberField: "[placeholder='Routing Number']",
    accountNumberField: "[placeholder='Account Number']",
    saveButton: "[data-test='bankaccount-submit']",
    
    // Validações
    onboardingDialog: "[data-test='user-onboarding-dialog-title']",
    finishedPage: ".MuiDialogContent-root",
    doneButton: "[data-test='user-onboarding-next']",
    completeTransactionButton: ".MuiStepLabel-labelContainer",
    page: ".NavBar-title",
  }

  const userData = {
    firstName: 'Thayse',
    lastName: 'Dias',
    username: 'thaysedias',
    password: 'Td252603###',
    bankName: 'The Best Bank',
    routingNumber: '123456789',
    accountNumber: '987654321',
    search: 'Ted',
    amount: '1000',
    description: 'Pagamento de teste'
  }

  it('Fluxo completo de cadastro, login e criação de conta bancária', () => {
    // 1. Cadastro de Usuário
    cy.visit('http://localhost:3000/signin')
    cy.get(selectors.signupLink).click()
    cy.get(selectors.firstNameField).type(userData.firstName)
    cy.get(selectors.lastNameField).type(userData.lastName)
    cy.get(selectors.usernameField).type(userData.username)
    cy.get(selectors.passwordField).type(userData.password)
    cy.get(selectors.confirmPasswordField).type(userData.password)
    cy.get(selectors.signupSubmitButton).click()

    // Validação do cadastro bem-sucedido
    cy.url().should('include', '/signin')

    // 2. Login
    cy.get(selectors.usernameField).type(userData.username)
    cy.get(selectors.passwordField).type(userData.password)
    cy.get(selectors.rememberCheckbox).check()
    cy.get(selectors.loginButton).click()

    // Validação do login bem-sucedido
    cy.get(selectors.onboardingDialog).should('be.visible')

    // 3. Criação de Conta Bancária
    cy.get(selectors.nextButton).click()
    cy.get(selectors.bankNameField).type(userData.bankName)
    cy.get(selectors.routingNumberField).type(userData.routingNumber)
    cy.get(selectors.accountNumberField).type(userData.accountNumber)
    cy.get(selectors.saveButton).click()

    // Validação da criação da conta bancária bem-sucedida
    cy.get(selectors.finishedPage).should('be.visible')
    cy.get(selectors.doneButton).click()
    cy.get(selectors.page).should('be.visible')

    // 4. Transferência bancária bem-sucedida 
    cy.get(selectors.newTransactionButton).click({ force: true })

    // Aguardar a página de nova transação carregar completamente
    cy.url().should('include', '/transaction/new')
    
    // Aguardar a página estabilizar verificando se o campo de busca está visível
    cy.get(selectors.searchField).should('be.visible')

    // Usar apenas force true e evitar scroll complexo
    cy.get(selectors.searchField).type(userData.search, { 
      force: true,
      delay: 100 
    })

    // Aguardar a busca completar
    cy.intercept('GET', '/users/search*').as('searchRequest')
    cy.wait('@searchRequest')
    
    // Clique forçado sem scroll complexo
    cy.get(selectors.contact)
      .contains(userData.search)
      .click({ force: true })

    // Preencher resto do formulário
    cy.get(selectors.amountField).type(userData.amount, { force: true })
    cy.get(selectors.descriptionField).type(userData.description, { force: true })
    cy.get(selectors.payButton).click({ force: true })

    // Validação da transferência bancária bem-sucedida
    cy.get(selectors.completeTransactionButton)
      .should('be.visible')
      .and('contain.text', 'Complete')

    // Histórico de transações com sucesso
    cy.get(selectors.homePage).click()
    cy.get(selectors.minePage).click()

    // Aguarda até que o histórico de transações esteja visível
    cy.get(selectors.minePage).should('be.visible')

    // Histórico de transações de um usuário sem transações anteriores
    cy.get(selectors.friendPage).click()
  })
})