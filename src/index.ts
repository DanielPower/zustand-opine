import zustand, { GetState, SetState, StoreApi } from "zustand";
import { devtools, NamedSet } from "zustand/middleware";

interface Slice {
  initialState: Record<string, any>;
}

export type TransformedStore<TStore extends object> = {
  [K in keyof TStore]: TStore[K] extends { initialState: infer U } ? U : never;
};

const structuredStore =
  <TStore extends Record<string, Slice>>(slices: Record<string, Slice>) =>
  (
    set: NamedSet<TStore>,
    get: GetState<TStore>,
    api: StoreApi<TStore>
  ): TransformedStore<TStore> =>
    Object.fromEntries(
      Object.entries(slices).map(([sliceKey, slice]) => [
        sliceKey,
        slice.initialState,
      ])
    ) as TransformedStore<TStore>;

const createStore = <TStore extends Record<string, any>>(
  slices: Record<string, Slice>,
  devtoolsOptions = {}
) => {
  type ActualStore = TransformedStore<TStore>;
  return zustand<ActualStore>(
    devtools<
      ActualStore,
      SetState<ActualStore>,
      GetState<ActualStore>,
      StoreApi<ActualStore>
    >(structuredStore<TStore>(slices), devtoolsOptions)
  );
};

export default createStore;
