import userData from '../fixtures/user/userData.json'
import CheckPage from '../pages/checkPage';


const checkPage = new CheckPage()
describe('Tentar visualizar o histórico de transações sem transações anteriores', () => {
    it('Deve exibir uma mensagem indicando que o usuário não possui transações anteriores', () => {
        checkPage.accessLoginPage()
        checkPage.login(userData.successSignUp.username, userData.successSignUp.password)
        checkPage.historyEmpty()
    });
});

describe('View successful transaction history', () => {
    it('Must display a users transaction history correctly', () => {
        checkPage.accessLoginPage()
        checkPage.login(userData.successSignUp.username, userData.successSignUp.password)
        checkPage.history()

    });
});
