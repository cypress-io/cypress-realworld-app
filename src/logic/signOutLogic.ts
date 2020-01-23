import { createLogic } from "redux-logic";
import { SIGNOUT_PENDING, signOutSuccess, signOutError } from "../actions/auth";
import { history } from "../index";

const signOutLogic = createLogic({
  type: SIGNOUT_PENDING,

  // @ts-ignore
  async process({ httpClient }, dispatch, done) {
    try {
      await httpClient.post(`http://localhost:3001/logout`);

      dispatch(signOutSuccess());

      history.push("/signin");
    } catch (error) {
      // @ts-ignore
      dispatch(signOutError({ error }));
    }

    done();
  }
});

export default signOutLogic;
