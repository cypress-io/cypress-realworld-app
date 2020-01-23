import {
  TAppReducerActions,
  APP_BOOTSTRAP_PENDING,
  APP_BOOTSTRAP_SUCCESS,
  APP_BOOTSTRAP_ERROR
} from "../actions/app";

export interface AppState {
  isBootstrapped: boolean;
}

const initialState = {
  isBootstrapped: false
};

export default function reducer(
  state: AppState = initialState,
  action: TAppReducerActions
) {
  switch (action.type) {
    case APP_BOOTSTRAP_PENDING:
      return {
        ...state,
        isBootstrapped: false
      };
    case APP_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        isBootstrapped: true
      };
    case APP_BOOTSTRAP_ERROR:
      return {
        ...state,
        isBootstrapped: false
      };
    default:
      return state;
  }
}
