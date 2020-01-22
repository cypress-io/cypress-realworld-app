import { createLogic } from "redux-logic";
import { ESignInActionTypes } from "../reducers";
import { signInSuccess, signInError } from "../actions/signin";
import { history } from "../index";

const signInLogic = createLogic({
  type: ESignInActionTypes.SIGNIN_PENDING,

  // @ts-ignore
  async process({ httpClient, action }, dispatch, done) {
    try {
      await httpClient.post(
        `http://localhost:3001/login`,
        // @ts-ignore
        action.payload
      );
      dispatch(signInSuccess());

      history.push("/");
    } catch (error) {
      // @ts-ignore
      dispatch(signInError({ error }));
    }

    done();
  }
});

export default signInLogic;
