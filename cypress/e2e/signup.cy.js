import NewAccPage from '../pages/signUpPage'
import userData from '../fixtures/user/userData.json'

const newAccLogin = new NewAccPage()


describe('Creating Login', () => {
  it('Sign up with sucess', () => {
    newAccLogin.accessLoginPage()
    //Test Case - Normal creating account - 1
    newAccLogin.createAcc(userData.successSignUp.firstName, userData.successSignUp.lastName, userData.successSignUp.username, userData.successSignUp.password, userData.successSignUp.confirmPassword)
    newAccLogin.successCreate()

    //Test Case - Password bigger than 4 caractheres - 2
    newAccLogin.createAcc(userData.successSignUp.firstName, userData.successSignUp.lastName, userData.successSignUp.username, userData.successSignUp.passwordB, userData.successSignUp.confirmPasswordB)
    newAccLogin.successCreate()
  })


  it('Sing up with failed', () => {
    //Test Case - Empty First Name 3
    newAccLogin.createEmptyName(userData.successSignUp.lastName, userData.successSignUp.username, userData.successSignUp.password, userData.successSignUp.confirmPassword)

    // Test Case - Empty Last Name 4
    newAccLogin.createEmptyLastName(userData.successSignUp.firstName, userData.successSignUp.username, userData.successSignUp.password, userData.successSignUp.confirmPassword)

    // Test Case - Empty User Name 5
    newAccLogin.createEmptyUserName(userData.successSignUp.firstName, userData.successSignUp.lastName, userData.successSignUp.password, userData.successSignUp.confirmPassword)

    // Test Case - Empty Confirm Password 6
    newAccLogin.createEmptyPassword(userData.successSignUp.firstName, userData.successSignUp.lastName, userData.successSignUp.username, userData.successSignUp.confirmPassword)

    // Test Case - Empty Password 7
    newAccLogin.createEmptyConfirmPassword(userData.successSignUp.firstName, userData.successSignUp.lastName, userData.successSignUp.username, userData.successSignUp.password)

    //Test Case - Empty all fields 8 
    newAccLogin.createEmptyAll()

    //Test Case - Different Password 9
    newAccLogin.createDiffPass(userData.successSignUp.firstName, userData.successSignUp.lastName, userData.successSignUp.username, userData.successSignUp.password, userData.successSignUp.differentPassword)

  });

})