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

export type OpineActions<TStore extends object> = {
	[K in keyof TStore]: TStore[K] extends { actions: infer U } ? U : never;
};

export interface OpineApi<TState extends object, TActions extends object>
	extends StoreApi<TState> {
	actions: TActions;
}

const createAction = <TState extends object, TActions extends object>(
	name: string,
	action: (
		set: NamedSet<TState>,
		get: GetState<TState>,
		api: StoreApi<TState>
	) => Function,
	set: NamedSet<TState>,
	get: GetState<TState>,
	api: OpineApi<TState, TActions>
) =>
	action(
		(prev: TState, replace: boolean) => set(prev, replace, name),
		get,
		api
	);

const structuredStore =
	<TState extends object, TActions extends object>(
		slices: Record<string, Slice>
	) =>
	(
		set: NamedSet<TState>,
		get: GetState<TState>,
		api: OpineApi<TState, TActions>
	): OpineState<TState> => {
		const actions = {};
		const state = {};
		Object.entries(slices).forEach(([sliceKey, slice]) => {
			actions[sliceKey] = {};
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
		api.actions = actions as TActions;
		return state as OpineState<TState>;
	};

const createStore = <TStore extends Record<string, any>>(
	slices: Record<string, Slice>,
	devtoolsOptions = {} // TODO add typing
) => {
	type State = OpineState<TStore>;
	type Actions = OpineActions<TStore>;
	return zustand<
		State,
		SetState<State>,
		GetState<State>,
		OpineApi<State, Actions>
	>(devtools(immer(structuredStore<State, Actions>(slices)), devtoolsOptions));
};

export default createStore;
