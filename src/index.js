import zustand from "zustand";
import { devtools } from "zustand/middleware";
import immer from "./middleware/immer";

const createSelectors = (store) => {
	store.use = {};
	Object.keys(store.getState()).forEach((sliceKey) => {
		store.use[sliceKey] = {};
		store.use[sliceKey].all = () => store((state) => state[sliceKey]);
		Object.entries(store.selectors[sliceKey]).forEach(
			([selectorKey, selector]) => {
				store.use[sliceKey][selectorKey] = () => store(selector);
			}
		);
	});
	return store;
};

const parseSlices = (slices) => {
	const initialState = {};
	const actions = {};
	const selectors = {};
	Object.entries(slices).forEach(([key, slice]) => {
		initialState[key] = slice.initialState;
		actions[key] = slice.actions;
		selectors[key] = slice.selectors;
	});
	return { initialState, actions, selectors };
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

const apiSelectors = (config, selectorSlices) => {
	return (set, get, api) => {
		api.selectors = {};
		Object.entries(selectorSlices).forEach(([sliceKey, selectors]) => {
			api.selectors[sliceKey] = {};
			Object.entries(selectors).forEach(([selectorKey, selector]) => {
				api.selectors[sliceKey][selectorKey] = selector;
			});
		});
		return config(set, get, api);
	};
};

const createStore = (slices) => {
	const { initialState, actions, selectors } = parseSlices(slices);
	return createSelectors(
		zustand(
			immer(
				devtools(
					apiActions(
						apiSelectors(() => initialState, selectors),
						actions
					)
				)
			)
		)
	);
};

export default createStore;
