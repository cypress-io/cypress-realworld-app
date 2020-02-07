export const NOTIFICATIONS_ALL_PENDING = "NOTIFICATIONS_ALL_PENDING";
export const NOTIFICATIONS_ALL_SUCCESS = "NOTIFICATIONS_ALL_SUCCESS";
export const NOTIFICATIONS_ALL_ERROR = "NOTIFICATIONS_ALL_ERROR";
export const NOTIFICATIONS_CREATE_PENDING = "NOTIFICATIONS_CREATE_PENDING";
export const NOTIFICATIONS_CREATE_SUCCESS = "NOTIFICATIONS_CREATE_SUCCESS";
export const NOTIFICATIONS_CREATE_ERROR = "NOTIFICATIONS_CREATE_ERROR";
export const NOTIFICATION_UPDATE_PENDING = "NOTIFICATION_UPDATE_PENDING";
export const NOTIFICATION_UPDATE_SUCCESS = "NOTIFICATION_UPDATE_SUCCESS";
export const NOTIFICATION_UPDATE_ERROR = "NOTIFICATION_UPDATE_ERROR";

export const notificationsAllPending = () =>
  ({
    type: NOTIFICATIONS_ALL_PENDING
  } as const);

export const notificationsAllSuccess = (payload: any) =>
  ({
    type: NOTIFICATIONS_ALL_SUCCESS,
    payload
  } as const);

export const notificationsAllError = (payload: any) =>
  ({
    type: NOTIFICATIONS_ALL_ERROR,
    payload,
    error: true
  } as const);

export const notificationsCreatePending = (payload: any) =>
  ({
    type: NOTIFICATIONS_CREATE_PENDING,
    payload
  } as const);

export const notificationsCreateSuccess = (payload: any) =>
  ({
    type: NOTIFICATIONS_CREATE_SUCCESS,
    payload
  } as const);

export const notificationsCreateError = (payload: any) =>
  ({
    type: NOTIFICATIONS_CREATE_ERROR,
    payload,
    error: true
  } as const);

export const notificationUpdatePending = (payload: any) =>
  ({
    type: NOTIFICATION_UPDATE_PENDING,
    payload
  } as const);

export const notificationUpdateSuccess = (payload: any) =>
  ({
    type: NOTIFICATION_UPDATE_SUCCESS,
    payload
  } as const);

export const notificationUpdateError = (payload: any) =>
  ({
    type: NOTIFICATION_UPDATE_ERROR,
    payload,
    error: true
  } as const);

export type TNotificationsActions =
  | ReturnType<typeof notificationsAllPending>
  | ReturnType<typeof notificationsAllSuccess>
  | ReturnType<typeof notificationsAllError>
  | ReturnType<typeof notificationsCreatePending>
  | ReturnType<typeof notificationsCreateSuccess>
  | ReturnType<typeof notificationsCreateError>
  | ReturnType<typeof notificationUpdatePending>
  | ReturnType<typeof notificationUpdateSuccess>
  | ReturnType<typeof notificationUpdateError>;

export type NotificationsActionDataTypes = TNotificationsActions["type"];
