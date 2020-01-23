import { ESignInActionTypes } from "../reducers";

export interface IReduxBaseAction {
  type: ESignInActionTypes;
}

export interface ISigninPendingAction extends IReduxBaseAction {
  type: ESignInActionTypes.SIGNIN_PENDING;
  payload: object;
}

export interface ISigninSuccessAction extends IReduxBaseAction {
  type: ESignInActionTypes.SIGNIN_SUCCESS;
}

export interface ISigninErrorAction extends IReduxBaseAction {
  type: ESignInActionTypes.SIGNIN_ERROR;
  payload: object;
  error: true;
}

export interface SignInPendingPayload {
  username: string;
  password: string;
}

export const signInPending = (
  payload: SignInPendingPayload
): ISigninPendingAction => ({
  type: ESignInActionTypes.SIGNIN_PENDING,
  payload
});

export const signInSuccess = (): ISigninSuccessAction => ({
  type: ESignInActionTypes.SIGNIN_SUCCESS
});

export const signInError = (payload: object): ISigninErrorAction => ({
  type: ESignInActionTypes.SIGNIN_ERROR,
  payload,
  error: true
});

export type TSignInReducerActions =
  | ISigninPendingAction
  | ISigninSuccessAction
  | ISigninErrorAction;
