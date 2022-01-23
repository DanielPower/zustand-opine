import zustand, { GetState, SetState, StoreApi } from "zustand";
import { devtools, NamedSet } from "zustand/middleware";
import immer from "./middleware/immer";

interface Slice {
	initialState: Record<string, any>;
	actions?: Record<string, any>;
}

export type OpineState<TStore extends object> = {
	[K in keyof TStore]: TStore[K] extends { initialState: infer U } ? U : never;
};

export interface OpineApi<TStore extends object> extends StoreApi<TStore> {
	actions: Record<string, Record<string, Function>>;
}

const createAction = <TStore extends Record<string, any>>(
	name: string,
	action: Function,
	set: NamedSet<TStore>,
	get: GetState<TStore>,
	api: StoreApi<TStore>
) =>
	action(
		(prev: TStore, replace: boolean) => set(prev, replace, name),
		get,
		api
	);

const structuredStore =
	<TStore extends Record<string, Slice>>(slices: Record<string, Slice>) =>
	(
		set: NamedSet<TStore>,
		get: GetState<TStore>,
		api: OpineApi<TStore>
	): OpineState<TStore> => {
		api.actions = {};
		const state = {};
		Object.entries(slices).forEach(([sliceKey, slice]) => {
			api.actions[sliceKey] = {};
			Object.entries(slice.actions).forEach(([actionKey, action]) => {
				api.actions[sliceKey][actionKey] = createAction(
					`${sliceKey}/${actionKey}`,
					action,
					set,
					get,
					api
				);
			});
			state[sliceKey] = slice.initialState;
		});
		return state as OpineState<TStore>;
	};

const createStore = <TStore extends Record<string, any>>(
	slices: Record<string, Slice>,
	devtoolsOptions = {} // TODO add typing
) => {
	type ActualStore = OpineState<TStore>;
	return zustand<ActualStore>(
		devtools(immer(structuredStore<TStore>(slices)), devtoolsOptions)
	);
};

export default createStore;
