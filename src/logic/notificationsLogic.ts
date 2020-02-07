import { createLogic } from "redux-logic";
import {
  NOTIFICATIONS_ALL_PENDING,
  NOTIFICATIONS_ALL_SUCCESS,
  NOTIFICATIONS_ALL_ERROR
} from "../actions/notifications";

const notificationsAllLogic = createLogic({
  type: NOTIFICATIONS_ALL_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: NOTIFICATIONS_ALL_SUCCESS,
    failType: NOTIFICATIONS_ALL_ERROR
  },

  // @ts-ignore
  process({ httpClient }) {
    return httpClient
      .get(`http://localhost:3001/notifications`)
      .then((resp: any) => resp.data.notifications);
  }
});

export default [notificationsAllLogic];
