# Namespaced slices for Zustand, with automatic action names for Redux Dev Tools

## Demo

https://codesandbox.io/s/zustand-namedslices-5qkke?file=/src/App.js

## Example

```js
import create from "zustand";
import namedslices from "zustand-namedslices";
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
    namedslices({
      bearSlice,
      fishSlice,
    })
  )
);
```

### Add named slices to existing store

```js
const useStore = create(
  devtools((set, get) => ({
    honey: 0,
    honeyBees: 5,
    produceHoney: (prev) => set({
      honey: prev.honey + prev.honeyBees,
    }),
    ...namedslices(set, get)({ bearSlice, fishSlice }),
  }))
)
```
