import {
  TNotificationsActions,
  NOTIFICATIONS_ALL_SUCCESS
} from "../actions/notifications";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { NotificationType } from "../models";

export interface NotificationsState {
  all: NotificationType[];
}

const initialState = {
  all: []
};

export default function reducer(
  state: NotificationsState = initialState,
  action: TAuthActions | TNotificationsActions
): NotificationsState {
  switch (action.type) {
    case NOTIFICATIONS_ALL_SUCCESS:
      return {
        ...state,
        all: action.payload
      };
    case SIGNOUT_SUCCESS:
    case SIGNOUT_ERROR:
      return {
        ...initialState
      };
    default:
      return state;
  }
}
