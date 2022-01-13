import zustand from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";

const createAction = (name, action, set, get, api) =>
  action((prev, replace) => set(prev, replace, name), get, api);

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

function createSelectors(store) {
  store.use = {};
  Object.keys(store.getState()).forEach((key) => {
    const selector = (state) => state[key];
    store.use[key] = () => store(selector);
  });
  return store;
}

const slicedState = (slices) => (set, get, api) => {
  api.actions = {};
  const initialState = {};
  Object.entries(slices).forEach(([sliceKey, slice]) => {
    Object.entries(slice.actions).forEach(([actionKey, action]) => {
      if (typeof api.actions[actionKey] !== "undefined") {
        throw new Error(`Duplicate action with name '${actionKey}' created`);
      }
      api.actions[actionKey] = createAction(actionKey, action, set, get, api);
      initialState[sliceKey] = slice.initialState;
    });
  });
  return initialState;
};

const createStore = (slices, devtoolsOptions = {}) => {
  const actualDevtoolsOptions = {
    ...devtoolsOptions,
    features: {
      ...devtoolsOptions?.features,
      test: false,
    },
  };

  return createSelectors(
    zustand(immer(devtools(slicedState(slices), actualDevtoolsOptions)))
  );
};

export default createStore;
