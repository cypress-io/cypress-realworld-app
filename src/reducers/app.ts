import { EAppActionTypes } from "./";
import { TAppReducerActions } from "../actions/app";

export interface Data {
  id: number;
  name: string;
}

export interface AppState {
  isBootstrapped: boolean;
  sampleData: Data[];
}

const initialState = {
  isBootstrapped: false,
  sampleData: []
};

export default function reducer(
  state: AppState = initialState,
  action: TAppReducerActions
) {
  switch (action.type) {
    case EAppActionTypes.APP_BOOTSTRAP:
      return {
        ...state,
        isBootstrapped: true
      };
    case EAppActionTypes.APP_DATA_SUCCESS:
      return {
        ...state,
        sampleData: action.payload.data
      };
    default:
      return state;
  }
}
