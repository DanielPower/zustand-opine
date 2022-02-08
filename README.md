# Zustand Opine

**Not ready for use yet. API still very much in _flux_**

Goals for 1.0.0
- [x] Structured store, with each slice being split up into `initialState`, `actions`, `selectors`
- [x] Redux Devtools support with automatic action names
- [ ] Fully typed, such that autocomplete it available on all state, actions, etc.
- [x] Use Immer to simplify nested mutations
- [ ] Fully tested with several example use-cases
- [ ] Testing, linting, formatting enforced by CI

## Opine Definition

transitive verb

To _state_ as an opinion

## Purpose

An opinionated Zustand store.

- Automates naming of actions for Redux Dev Tools
- Includes Immer for simpler state management
- Reduces boilerplate when writing a namespaced multi-slice store

## Demo
https://codesandbox.io/s/zustand-opine-5qkke?file=/src/App.js
