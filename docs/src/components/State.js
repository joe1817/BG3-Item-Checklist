const State = {
	state() {
		const checked   = (localStorage.getItem("checked")   || "").split(",");
		const collapsed = (localStorage.getItem("collapsed") || "").split(",");
		const disabled  = (localStorage.getItem("disabled")  || "").split(",");
		const showComplete  = (localStorage.getItem("showComplete") == "false") ? false : true;
		const showImages  = (localStorage.getItem("showImages") == "false") ? false : (window.innerWidth > 768);
		const lastViewed  = localStorage.getItem("lastViewed");

		const filterState = {};
		const expansionState = {};
		const checkboxState = {};

		const fillFilterState = (filters) => {
			for (const filter of filters) {
				filterState[filter.id] = !disabled.includes(filter.id);
				if (filter.children) {
					fillFilterState(filter.children);
				}
			}
		}
		fillFilterState(filterData);

		const fillEntryState = (entry) => {
			if (entry.children === undefined) {
				checkboxState[entry.id] = checked.includes(entry.id);
			} else {
				expansionState[entry.id] = !collapsed.includes(entry.id);
				for (const subentry of entry.children) {
					fillEntryState(subentry);
				}
			}
		}
		fillEntryState(entryData);

		return {
			filterState: filterState,
			showCompleteState: showComplete,
			showImagesState: showImages,
			lastViewedWritePending: false, // scrolling too fast can cause too many writes, limit the rate
			searchString: "",

			expansionState: expansionState,
			matchesSearch: {},
			countProgress: {},
			countTotal: {},

			checkboxState: checkboxState,

			lastViewedState: lastViewed,
		}
	},
	mutations: {
		toggleFilter(state, updates) {
			Object.entries(updates).forEach(([key, val]) => {
				state.filterState[key] = updates[key];
			});
		},
		toggleExpansion(state, container) {
			state.expansionState[container.id] = !state.expansionState[container.id];
		},
		toggleCheckbox(state, entry) {
			state.checkboxState[entry.id] = !state.checkboxState[entry.id];
		},
		toggleShowComplete(state) {
			state.showCompleteState = !state.showCompleteState;
		},
		toggleShowImages(state) {
			state.showImagesState = !state.showImagesState;
		},
		clearAllCheckboxes(state, container) {
			const clear = (container) => {
				for (const entry of container.children) {
					if (entry.children === undefined) {
						state.checkboxState[entry.id] = false;
					} else {
						clear(entry);
					}
				}
			}
			clear(container);
		},
		updateLastViewed(state, s) {
			state.lastViewedState = s;
		},
		updateSearchString(state, s) {
			state.searchString = s;
		}
	},
	actions: {
		toggleFilterAndSave({ commit, state }, payload) {
			commit("toggleFilter", payload);

			let obj = state.filterState;
			let data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem("disabled", data);
		},
		toggleExpansionAndSave({ commit, state }, payload) {
			commit("toggleExpansion", payload);

			let obj = state.expansionState;
			let data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem("collapsed", data);
		},
		toggleCheckboxAndSave({ commit, state }, payload) {
			commit("toggleCheckbox", payload);

			let obj = state.checkboxState;
			let data = Object.keys(obj).filter(key => obj[key] === true).join(",");
			localStorage.setItem("checked", data);
		},
		toggleShowCompleteAndSave({ commit, state }) {
			commit("toggleShowComplete");

			localStorage.setItem("showComplete", state.showCompleteState);
		},
		toggleShowImagesAndSave({ commit, state }) {
			commit("toggleShowImages");

			localStorage.setItem("showImages", state.showImagesState);
		},
		clearAllCheckboxesAndSave({ commit, state }, payload) {
			commit("clearAllCheckboxes", payload);

			let obj = state.checkboxState;
			let data = Object.keys(obj).filter(key => obj[key] === true).join(",");
			localStorage.setItem("checked", data);
		},
		updateLastViewedAndSave({ commit, state }, payload) {
			if (state.searchString || payload === state.lastViewedState) {
				return;
			}

			commit("updateLastViewed", payload);

			if (!state.lastViewedWritePending) {
				state.lastViewedWritePending = true;
				setTimeout(() => {
					let data = state.lastViewedState;
					localStorage.setItem("lastViewed", data);
					state.lastViewedWritePending = false;
				}, 2000);
			}
		}
	}
}