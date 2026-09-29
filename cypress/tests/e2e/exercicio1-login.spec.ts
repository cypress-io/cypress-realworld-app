import database from '../../../data/database.json'
import LoginPage from '../e2e/pages/loginPage'


const loginPage = new LoginPage()



describe('Login com sucesso', () => {
  it.only('Deve fazer login com um usuário válido', () => {
    loginPage.accessLoginPage()
    loginPage.loginUser(database.users[3].username, 's3cret')
    })
})

describe('Usuario invalido, senha invalida', () => {
  it('Deve exibir uma mensagem de erro ao fazer login com credenciais inválidas', () => {
    loginPage.accessLoginPage()
    loginPage.loginUser('userinvalido', 'senhainvalida')
    loginPage.checkWrongCredentialsError()
  })
})

describe('Usuario valido, senha invalida', () => {
  it('Deve exibir uma mensagem de erro ao fazer login com credenciais inválidas', () => {
    loginPage.accessLoginPage()
    loginPage.loginUser(database.users[3].username, 'senhainvalida')
    loginPage.checkWrongCredentialsError()
  })
})

describe('Usuario invalido, senha valida', () => {
  it('Deve exibir uma mensagem de erro ao fazer login com credenciais inválidas', () => {
    loginPage.accessLoginPage()
    loginPage.loginUser('userinvalido', 's3cret')
    loginPage.checkWrongCredentialsError()
  })
})