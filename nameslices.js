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

const nameslices = (slices) => (set, get) =>
  Object.fromEntries(
    slices.map((slice) => [
      slice.name,
      {
        ...Object.fromEntries(
          Object.entries(slice.actions).map(([key, action]) => [
            key,
            action({
              set: localSet(set, slice.name, `${slice.name}/${key}`),
              globalSet: globalSet(set, `${slice.name}/${key}`),
              get: localGet(get, slice.name),
              globalGet: get,
            }),
          ])
        ),
        ...slice.initialState,
      },
    ])
  );

export default nameslices;
