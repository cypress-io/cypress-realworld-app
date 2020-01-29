import { createLogic } from "redux-logic";
import {
  USERS_ALL_PENDING,
  USERS_ALL_SUCCESS,
  USERS_ALL_ERROR,
  USERS_SEARCH_PENDING,
  USERS_SEARCH_SUCCESS,
  USERS_SEARCH_ERROR
} from "../actions/users";

const usersAllLogic = createLogic({
  type: USERS_ALL_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: USERS_ALL_SUCCESS,
    failType: USERS_ALL_ERROR
  },

  // @ts-ignore
  process({ httpClient }) {
    return httpClient
      .get(`http://localhost:3001/users`)
      .then((resp: any) => resp.data.users);
  }
});

const usersSearchLogic = createLogic({
  type: USERS_SEARCH_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: USERS_SEARCH_SUCCESS,
    failType: USERS_SEARCH_ERROR
  },

  // @ts-ignore
  process({ httpClient }) {
    return httpClient
      .get(`http://localhost:3001/users/search`)
      .then((resp: any) => resp.data.users);
  }
});

export default [usersAllLogic, usersSearchLogic];
