import { EAppActionTypes } from "../reducers";
import { User } from "../models";

export interface IReduxBaseAction {
  type: EAppActionTypes;
}

export interface IBootstrapAction extends IReduxBaseAction {
  type: EAppActionTypes.APP_BOOTSTRAP;
}

export interface IAppBootstrapPendingAction extends IReduxBaseAction {
  type: EAppActionTypes.APP_BOOTSTRAP_PENDING;
  payload: object;
}

export interface IAppBootstrapSuccessAction extends IReduxBaseAction {
  type: EAppActionTypes.APP_BOOTSTRAP_SUCCESS;
  payload: {
    user: Partial<User>;
  };
}

export interface IAppBootstrapErrorAction extends IReduxBaseAction {
  type: EAppActionTypes.APP_BOOTSTRAP_ERROR;
  payload: object;
  error: true;
}

export const bootstrap = (): IBootstrapAction => ({
  type: EAppActionTypes.APP_BOOTSTRAP
});

export const appBootstrapPending = (
  payload: any
): IAppBootstrapPendingAction => ({
  type: EAppActionTypes.APP_BOOTSTRAP_PENDING,
  payload
});

export const appBootstrapSuccess = (
  payload: any
): IAppBootstrapSuccessAction => ({
  type: EAppActionTypes.APP_BOOTSTRAP_SUCCESS,
  payload
});

export const appBootstrapError = (
  payload: object
): IAppBootstrapErrorAction => ({
  type: EAppActionTypes.APP_BOOTSTRAP_ERROR,
  payload,
  error: true
});

export type TAppReducerActions =
  | IBootstrapAction
  | IAppBootstrapPendingAction
  | IAppBootstrapSuccessAction
  | IAppBootstrapErrorAction;
