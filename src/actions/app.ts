import { EAppActionTypes } from "../reducers";
import { Data } from "../reducers/app";

export interface IReduxBaseAction {
  type: EAppActionTypes;
}

export interface IBootstrapAction extends IReduxBaseAction {
  type: EAppActionTypes.APP_BOOTSTRAP;
}

export interface IAppDataPendingAction extends IReduxBaseAction {
  type: EAppActionTypes.APP_DATA_PENDING;
  payload: object;
}

export interface IAppDataSuccessAction extends IReduxBaseAction {
  type: EAppActionTypes.APP_DATA_SUCCESS;
  payload: {
    data: Data[];
  };
}

export interface IAppDataErrorAction extends IReduxBaseAction {
  type: EAppActionTypes.APP_DATA_ERROR;
  payload: object;
  error: true;
}

export const bootstrap = (): IBootstrapAction => ({
  type: EAppActionTypes.APP_BOOTSTRAP
});

export const appDataPending = (payload: any): IAppDataPendingAction => ({
  type: EAppActionTypes.APP_DATA_PENDING,
  payload
});

export const appDataSuccess = (payload: any): IAppDataSuccessAction => ({
  type: EAppActionTypes.APP_DATA_SUCCESS,
  payload
});

export const appDataError = (payload: any): IAppDataErrorAction => ({
  type: EAppActionTypes.APP_DATA_ERROR,
  payload,
  error: true
});

export type TAppReducerActions =
  | IBootstrapAction
  | IAppDataPendingAction
  | IAppDataSuccessAction
  | IAppDataErrorAction;
