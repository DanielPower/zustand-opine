import zustand from "zustand";
import { devtools } from "zustand/middleware";
import immer from "./middleware/immer";

const parseSlices = (slices) => {
	const initialState = {};
	const actions = {};
	Object.entries(slices).forEach(([key, slice]) => {
		initialState[key] = slice.initialState;
		actions[key] = slice.actions;
	});
	return { initialState, actions };
};

const apiActions = (config, actionSlices) => {
	return (set, get, api) => {
		api.actions = {};
		Object.entries(actionSlices).forEach(([sliceKey, actions]) => {
			api.actions[sliceKey] = {};
			Object.entries(actions).forEach(([actionKey, action]) => {
				api.actions[sliceKey][actionKey] = action(
					(prevState) => set(prevState, false, `${sliceKey}/${actionKey}`),
					get,
					api
				);
			});
		});
		return config(set, get, api);
	};
};

const createStore = (slices) => {
	const { initialState, actions } = parseSlices(slices);
	return zustand(immer(devtools(apiActions(() => initialState, actions))));
};

export default createStore;
