import { createLogic } from "redux-logic";
import { EAppActionTypes } from "../reducers";
import { appDataSuccess } from "../actions/app";

const appBootstrapLogic = createLogic({
  type: EAppActionTypes.APP_BOOTSTRAP,

  // @ts-ignore
  async process({ httpClient }, dispatch, done) {
    const { data } = await httpClient.get(`http://localhost:3001/transactions`);

    dispatch(appDataSuccess({ data }));
    done();
  }
});

export default appBootstrapLogic;
