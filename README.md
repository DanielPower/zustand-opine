# Zustand Opine

transitive verb

To _state_ as an opinion

An opinionated Zustand store for namespaced slices.

## Demo

https://codesandbox.io/s/zustand-namedslices-5qkke?file=/src/App.js

## Example

```js
import opine from "zustand-opine";

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

const useStore = opine({
  bearSlice,
  fishSlice,
});
```

### Add named slices to existing store

```js
import create from 'zustand';
import { opineMiddleware } from 'zustand-opine';
import bearSlice from './bearSlice';
import fishSlice from './fishSlice';

const useStore = create((set, get) =>
  honey: 0,
  honeyBees: 5,
  produceHoney: (prev) => set({
    honey: prev.honey + prev.honeyBees,
  }),
  ...opineMiddleware(set, get)({
    bearSlice, 
    fishSlice
  }),
)
```
