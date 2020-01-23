import { createLogic } from "redux-logic";
import { bootstrap } from "../actions/app";
import { SIGNIN_PENDING, signInSuccess, signInError } from "../actions/auth";
import { history } from "../index";

const signInLogic = createLogic({
  type: SIGNIN_PENDING,

  // @ts-ignore
  async process({ httpClient, action }, dispatch, done) {
    try {
      await httpClient.post(
        `http://localhost:3001/login`,
        // @ts-ignore
        action.payload
      );
      dispatch(signInSuccess());

      dispatch(bootstrap());

      history.push("/");
    } catch (error) {
      // @ts-ignore
      dispatch(signInError({ error }));
    }

    done();
  }
});

export default signInLogic;
