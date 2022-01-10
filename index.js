import zustand from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";

const createAction = (name, action, set, get, api) =>
  action((prev, replace) => set(prev, replace, name), get, api);

export const createSlice =
  (sliceName, { actions, initialState }) =>
  (set, get, api) => ({
    [sliceName]: {
      ...Object.fromEntries(
        Object.entries(actions).map(([actionName, action]) => [
          actionName,
          createAction(`${sliceName}/${actionName}`, action, set, get, api),
        ])
      ),
      ...initialState,
    },
  });

const immer = (config) => (set, get, api) =>
  config(
    (partial, replace) => {
      const nextState =
        typeof partial === "function" ? produce(partial) : partial;
      return set(nextState, replace);
    },
    get,
    api
  );

const createStore = (slices) =>
  zustand(
    immer(
      devtools((set, get, api) =>
        slices.reduce(
          (state, slice) => ({
            ...state,
            ...slice(set, get, api),
          }),
          {}
        )
      )
    )
  );

export default createStore;
