import { send } from 'xstate';
import userData from '../fixtures/user/userData.json'
import TransferPage from '../pages/transferPage.js'

const transferPage = new TransferPage();

describe('Send money with positive balance', () => {
  it('Send-Transfer money', () => {
    transferPage.accessLoginPage()
    transferPage.login(userData.successSignUp.username, userData.successSignUp.password)
    transferPage.sendMoney('120', 'Market')
    
  });
  it('Send-Transfer money without balance', () => {
    transferPage.accessLoginPage()
    transferPage.login(userData.successSignUp.username, userData.successSignUp.password)
    transferPage.sendMoneyNoMoney('240', 'Bill')
    
  });
});