import produce, { enableMapSet } from "immer";
import zustand from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import shallow from "zustand/shallow";
import pipe from "ramda/es/pipe";

const immer = (config) => (set, get, api) => {
	enableMapSet();
	return config(
		(partial, replace) => {
			const nextState =
				typeof partial === "function" ? produce(partial) : partial;
			return set(nextState, replace);
		},
		get,
		api
	);
};

// Creates subscriptions to automatically update query parameter values when query param
// state changes.
const createQueryParamSubscriptions = (store) => {
	store.subscribe(
		(state) =>
			Object.values(store.queryParams).map((paramDetails) =>
				paramDetails.selector(state)
			),
		() => {
			const state = store.getState();
			const urlParams = new URLSearchParams(window.location.search);
			Object.entries(store.queryParams).forEach(([urlKey, paramDetails]) => {
				const value = paramDetails.selector(state);
				if (value && value !== paramDetails.initial) {
					urlParams.set(urlKey, paramDetails.serialize(value));
				} else {
					urlParams.delete(urlKey);
				}
			});
			window.history.replaceState(
				null,
				"",
				`${window.location.pathname}?${urlParams}`
			);
		},
		{ equalityFn: shallow }
	);
	return store;
};

// Inverts the slices so that the keys initialState, actions, etc. are at the root,
// and slice keys are under each of those.
const parseSlices = (slices) =>
	Object.fromEntries(
		["initialState", "actions", "queryParams", "selectors"].map(
			(propertyKey) => [
				propertyKey,
				Object.fromEntries(
					Object.entries(slices).map(([sliceKey, slice]) => [
						sliceKey,
						slice[propertyKey] || {},
					])
				),
			]
		)
	);

const apiActions = (config, actionSlices) => (set, get, api) => {
	api.actions = Object.fromEntries(
		Object.entries(actionSlices).map(([sliceKey, actions]) => [
			sliceKey,
			Object.fromEntries(
				Object.entries(actions).map(([actionKey, action]) => [
					actionKey,
					action(
						(reducer, actionName = null) =>
							set(reducer, false, `${sliceKey}/${actionName ?? actionKey}`),
						get,
						api
					),
				])
			),
		])
	);
	return config(set, get, api);
};

const apiQueryParams = (config, queryParamSlices) => {
	const initialQueryParams = new URLSearchParams(window.location.search);
	return (set, get, api) => {
		const initialState = config(set, get, api);
		api.queryParams = {};
		Object.entries(queryParamSlices).forEach(([sliceKey, slice]) => {
			Object.entries(slice).forEach(([storeKey, paramDetails]) => {
				api.queryParams[paramDetails.key] = {
					...paramDetails,
					initial: initialState[sliceKey][storeKey],
					selector: (state) => state[sliceKey][storeKey],
				};
				const paramValue = initialQueryParams.get(paramDetails.key);
				initialState[sliceKey][storeKey] =
					paramValue === null
						? initialState[sliceKey][storeKey]
						: paramDetails.deserialize(paramValue);
			});
		});
		return initialState;
	};
};

const apiSelectors = (config, selectorSlices) => (set, get, api) => {
	api.selectors = selectorSlices;
	return config(set, get, api);
};

const createStore = (slices) => {
	const { initialState, actions, queryParams, selectors } = parseSlices(slices);
	return pipe(
		createQueryParamSubscriptions,
		zustand,
		subscribeWithSelector,
		immer,
		devtools,
		(config) => apiSelectors(config, selectors),
		(config) => apiQueryParams(config, queryParams),
		(config) => apiActions(config, actions)
	)(() => initialState);
};

export default createStore;
