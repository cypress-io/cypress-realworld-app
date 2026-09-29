import LoginPage from '../e2e/pages/loginPage'
import NewUserRegisterPage from '../e2e/pages/newUserRegisterPage'

const Chance = require('chance')

const chance = new Chance()
const loginPage = new LoginPage()
const newUserRegisterPage = new NewUserRegisterPage()


describe('Registro de novo usuario com sucesso', () => {
  it('Registro de um novo usuario com informacoes validas', () => {
    loginPage.accessLoginPage()
    newUserRegisterPage.registerLink()
    newUserRegisterPage.fillFirstName(chance.first())
    newUserRegisterPage.fillLastName(chance.last())
    newUserRegisterPage.fillUserName(chance.first())
    newUserRegisterPage.fillPassword('Senha123')
    newUserRegisterPage.fillConfirmPassword('Senha123')
    newUserRegisterPage.validateSignUpButton()
  })
})

describe('Registro de usuario incompleto (First Name, Confirm Password)', () => {
  it('Botao deve permanecer desabilitado com os campos faltantes', () => {
    loginPage.accessLoginPage()
    newUserRegisterPage.registerLink()
    newUserRegisterPage.fillLastName(chance.last())
    newUserRegisterPage.fillUserName(chance.first())
    newUserRegisterPage.fillPassword('Senha123')
    newUserRegisterPage.validateRequiredFieldError('firstName')
    newUserRegisterPage.validateRequiredFieldError('confirmPassword')
    newUserRegisterPage.validateSignUpButton()  
  })
})

describe('Registro de usuario incompleto (Last Name, User Name, Password)', () => {
  it.only('Botao deve permanecer desabilitado com os campos faltantes', () => {
    loginPage.accessLoginPage()
    newUserRegisterPage.registerLink()
    newUserRegisterPage.fillFirstName(chance.first())
    newUserRegisterPage.fillConfirmPassword('Senha123')
    newUserRegisterPage.validateRequiredFieldError('lastName')
    newUserRegisterPage.validateRequiredFieldError('userName')
    newUserRegisterPage.validateRequiredFieldError('password')
    newUserRegisterPage.validateSignUpButton()  
  })
})

describe('Registro de usuario incompleto (Quantidade de caracteres)', () => {
  it('Botao deve permanecer desabilitado com os campos incompletos', () => {
   loginPage.accessLoginPage()
    newUserRegisterPage.registerLink()
    newUserRegisterPage.fillFirstName('T')
    newUserRegisterPage.fillLastName('T')
    newUserRegisterPage.fillUserName('T')
    newUserRegisterPage.fillPassword('S')
    newUserRegisterPage.fillConfirmPassword('S')
    newUserRegisterPage.validateSignUpButton() 
  })
})