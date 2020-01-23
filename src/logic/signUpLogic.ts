import { createLogic } from "redux-logic";
import { SIGNUP_PENDING, signUpSuccess, signUpError } from "../actions/auth";
import { history } from "../index";

const signUpLogic = createLogic({
  type: SIGNUP_PENDING,

  // @ts-ignore
  async process({ httpClient, action }, dispatch, done) {
    try {
      await httpClient.post(
        `http://localhost:3001/users`,
        // @ts-ignore
        action.payload
      );

      dispatch(signUpSuccess());

      history.push("/signin");
    } catch (error) {
      // @ts-ignore
      dispatch(signUpError({ error }));
    }

    done();
  }
});

export default signUpLogic;
