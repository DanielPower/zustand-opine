# Usage

WIP more docs to come

```js
import create from "zustand";
import nameslices from "nameslices";
import { devtools } from "zustand/middleware";

const MAX_FISH = 20;

const bearSlice = {
  actions: {
    eatFish:
      ({ globalSet }) =>
      (count) =>
        globalSet((prev) => ({
          fishSlice: {
            ...fishSlice,
            fishes: prev.fishSlice.fishes - count * prev.bearSlice.bears,
          },
        })),
    addBear:
      ({ set }) =>
      () =>
        set((prev) => ({ bears: prev.bears + 1 })),
  },
  initialState: {
    bears: 0,
  },
};

const fishSlice = {
  actions: {
    repopulate:
      ({ set }) =>
      () =>
        set(() => ({ fishes: MAX_FISH })),
  },
  initialState: {
    fishes: MAX_FISH,
  },
};

const useStore = create(
  devtools(
    nameslices({
      bearSlice,
      fishSlice,
    })
  )
);
```
