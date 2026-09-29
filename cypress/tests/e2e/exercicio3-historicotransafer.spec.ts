import database from '../../../data/database.json'
import LoginPage from './pages/loginPage'
import HistoricPage from './pages/historicPage'

const loginPage = new LoginPage()
const historicPage = new HistoricPage()

describe('Visualizar histórico de transações com sucesso', () => {
  it('Deve exibir o histórico de transações de um usuário corretamente', () => {
    loginPage.accessLoginPage()
    loginPage.loginUser(database.users[3].username, 's3cret')
    historicPage.accessHistoricPage()
    historicPage.viewTransactionsList()
  });
});


describe('Tentar visualizar o histórico de transações sem transações anteriores', () => {
  it.only('Deve exibir uma mensagem indicando que o usuário não possui transações anteriores', () => {
    loginPage.accessLoginPage()
    loginPage.loginUser('QAUser', 'Senha123')
    historicPage.accessHistoricPage()
    historicPage.noTransactionMessage()
  });
});