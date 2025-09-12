import { sign } from 'crypto';
import userData from '../fixtures/user/userData.json'
import SignInPage from '../pages/signInPage';

const signinPage = new SignInPage()

describe('Login Screen', () => {
    it('Login with Success', () => {
        signinPage.accessLoginPage()
        
        // Sign in with unselect remember me box and logout to check if don't have data saved in the field
        signinPage.loginSucces(userData.successSignUp.username, userData.successSignUp.password)

        //Sign in with select remember me box and logout to check if has some data saved in the field
        signinPage.loginSuccesBox(userData.successSignUp.username, userData.successSignUp.password)
              
    });

    it('Login with Fail', () => {
        signinPage.accessLoginPage()

        signinPage.signinIncUser('Guido', '5123')
        signinPage.signinIncPass('admin', '12456')      
        signinPage.signinEmptyPass(userData.successSignUp.username)
        signinPage.signinEmptyUser(userData.successSignUp.password)
        signinPage.signinEmpty()

    });
});