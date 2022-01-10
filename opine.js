import zustand from "zustand";
import { devtools } from "zustand/middleware";

const globalSet = (set, key) => (stateCallback, replace) =>
  set(stateCallback, replace, key);

const localSet = (set, slice, key) => (stateCallback, replace) =>
  set(
    (prev) => ({
      [slice]: {
        ...(!replace && prev[slice]),
        ...stateCallback(prev[slice]),
      },
    }),
    false,
    key
  );

const localGet = (get, slice) => () => get()[slice];

export const opineMiddleware = (slices) => (set, get) =>
  Object.fromEntries(
    Object.entries(slices).map(([name, slice]) => [
      name,
      {
        ...Object.fromEntries(
          Object.entries(slice.actions).map(([key, action]) => [
            key,
            action({
              set: localSet(set, name, { name: `${name}/${key}` }),
              globalSet: globalSet(set, { name: `${name}/${key}` }),
              get: localGet(get, name),
              globalGet: get,
            }),
          ])
        ),
        ...slice.initialState,
      },
    ])
  );

const opine = (slices) => zustand(devtools(opineMiddleware(slices)));

export default opine;
