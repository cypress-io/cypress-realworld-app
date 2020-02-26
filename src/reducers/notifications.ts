import {
  TNotificationsActions,
  NOTIFICATIONS_ALL_SUCCESS,
  NOTIFICATIONS_ALL_PENDING,
  NOTIFICATIONS_ALL_ERROR
} from "../actions/notifications";
import { TAuthActions, SIGNOUT_SUCCESS, SIGNOUT_ERROR } from "../actions/auth";
import { NotificationResponseItem } from "../models";

export interface NotificationsState {
  meta: {
    isLoading: boolean;
  };
  all: NotificationResponseItem[];
}

const initialState = {
  meta: {
    isLoading: false
  },
  all: []
};

export default function reducer(
  state: NotificationsState = initialState,
  action: TAuthActions | TNotificationsActions
): NotificationsState {
  switch (action.type) {
    case NOTIFICATIONS_ALL_PENDING:
      return {
        ...state,
        meta: {
          isLoading: true
        }
      };
    case NOTIFICATIONS_ALL_ERROR:
      return {
        ...state,
        meta: {
          isLoading: false
        }
      };
    case NOTIFICATIONS_ALL_SUCCESS:
      return {
        ...state,
        meta: {
          isLoading: false
        },
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
