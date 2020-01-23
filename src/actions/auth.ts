export const SIGNIN_PENDING = "SIGNIN_PENDING";
export const SIGNIN_SUCCESS = "SIGNIN_SUCCESS";
export const SIGNIN_ERROR = "SIGNIN_ERROR";

export interface SignInPendingPayload {
  username: string;
  password: string;
}

export const signInPending = (payload: SignInPendingPayload) =>
  ({
    type: SIGNIN_PENDING,
    payload
  } as const);

export const signInSuccess = () =>
  ({
    type: SIGNIN_SUCCESS
  } as const);

export const signInError = (payload: object) =>
  ({
    type: SIGNIN_ERROR,
    payload,
    error: true
  } as const);

export type TAuthActions =
  | ReturnType<typeof signInPending>
  | ReturnType<typeof signInSuccess>
  | ReturnType<typeof signInError>;

export type AuthActionDataTypes = TAuthActions["type"];
