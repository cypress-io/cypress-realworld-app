import { UserSettingsPayload } from "../models";
export const USERS_ALL_PENDING = "USERS_ALL_PENDING";
export const USERS_ALL_SUCCESS = "USERS_ALL_SUCCESS";
export const USERS_ALL_ERROR = "USERS_ALL_ERROR";
export const USERS_SEARCH_PENDING = "USERS_SEARCH_PENDING";
export const USERS_SEARCH_SUCCESS = "USERS_SEARCH_SUCCESS";
export const USERS_SEARCH_ERROR = "USERS_SEARCH_ERROR";
export const USER_UPDATE_PENDING = "USER_UPDATE_PENDING";
export const USER_UPDATE_SUCCESS = "USER_UPDATE_SUCCESS";
export const USER_UPDATE_ERROR = "USER_UPDATE_ERROR";

export const usersAllPending = () =>
  ({
    type: USERS_ALL_PENDING
  } as const);

export const usersAllSuccess = (payload: any) =>
  ({
    type: USERS_ALL_SUCCESS,
    payload
  } as const);

export const usersAllError = (payload: any) =>
  ({
    type: USERS_ALL_ERROR,
    payload,
    error: true
  } as const);

export const usersSearchPending = (payload: any) =>
  ({
    type: USERS_SEARCH_PENDING,
    payload
  } as const);

export const usersSearchSuccess = (payload: any) =>
  ({
    type: USERS_SEARCH_SUCCESS,
    payload
  } as const);

export const usersSearchError = (payload: any) =>
  ({
    type: USERS_SEARCH_ERROR,
    payload,
    error: true
  } as const);

export const userUpdatePending = (payload: UserSettingsPayload) =>
  ({
    type: USER_UPDATE_PENDING,
    payload
  } as const);

export const userUpdateSuccess = (payload: any) =>
  ({
    type: USER_UPDATE_SUCCESS,
    payload
  } as const);

export const userUpdateError = (payload: any) =>
  ({
    type: USER_UPDATE_ERROR,
    payload,
    error: true
  } as const);

export type TUsersActions =
  | ReturnType<typeof usersAllPending>
  | ReturnType<typeof usersAllSuccess>
  | ReturnType<typeof usersAllError>
  | ReturnType<typeof usersSearchPending>
  | ReturnType<typeof usersSearchSuccess>
  | ReturnType<typeof usersSearchError>
  | ReturnType<typeof userUpdatePending>
  | ReturnType<typeof userUpdateSuccess>
  | ReturnType<typeof userUpdateError>;

export type UsersActionDataTypes = TUsersActions["type"];
