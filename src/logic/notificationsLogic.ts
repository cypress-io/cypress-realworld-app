import { createLogic } from "redux-logic";
import {
  NOTIFICATIONS_ALL_PENDING,
  NOTIFICATIONS_ALL_SUCCESS,
  NOTIFICATIONS_ALL_ERROR,
  NOTIFICATION_UPDATE_PENDING,
  NOTIFICATION_UPDATE_SUCCESS,
  NOTIFICATION_UPDATE_ERROR
} from "../actions/notifications";

const notificationsAllLogic = createLogic({
  type: [NOTIFICATIONS_ALL_PENDING, NOTIFICATION_UPDATE_SUCCESS],
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

const notificationsUpdateLogic = createLogic({
  type: NOTIFICATION_UPDATE_PENDING,
  processOptions: {
    dispatchReturn: true,
    successType: NOTIFICATION_UPDATE_SUCCESS,
    failType: NOTIFICATION_UPDATE_ERROR
  },

  // @ts-ignore
  process({ httpClient, action }) {
    // @ts-ignore
    const { payload } = action;

    return (
      httpClient
        // @ts-ignore
        .patch(`http://localhost:3001/notifications/${payload.id}`, payload)
        .then((resp: any) => resp.data)
    );
  }
});

export default [notificationsAllLogic, notificationsUpdateLogic];
