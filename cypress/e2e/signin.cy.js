import userData from '../fixtures/user/userData.json'
import SignInPage from '../pages/signInPage';

const signinPage = new SignInPage()

describe('Login Screen', () => {
    it('Login with Success', () => {
        signinPage.accessLoginPage()

        // This is the first login
        // Login with unselect remember me box and logout to check if don't have data saved in the field
        signinPage.loginSucces(userData.successSignUp.username, userData.successSignUp.password)
        
        //Login with select remember me box and logout to check if has some data saved in the field
        signinPage.loginSuccesBox(userData.successSignUp.username, userData.successSignUp.password)

    });

    it('Login with Fail', () => {

        signinPage.accessLoginPage()
        // Login using wrong username and wrong password
        signinPage.signinIncUser('Guido', '5123')
        // Login using wrong password
        signinPage.signinIncPass('admin', '12456')
        // Login using empty password
        signinPage.signinEmptyPass(userData.successSignUp.username)
        // Login using empty username
        signinPage.signinEmptyUser(userData.successSignUp.password)
        // Login using empty user and password  
        signinPage.signinEmpty()
    });
});