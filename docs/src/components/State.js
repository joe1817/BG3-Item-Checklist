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
			// Options
			filterState: filterState,
			showCompleteState: showComplete,
			showImagesState: showImages,
			lastViewedWritePending: false, // scrolling too fast can cause too many writes, limit the rate
			searchString: "",

			// Containers
			expansionState: expansionState,
			matchesSearch: {},
			countProgress: {},
			countTotal: {},

			// Entries
			checkboxState: checkboxState,

			// App
			lastViewedState: lastViewed,
		}
	},
	mutations: {
		toggleFilter(state, updates) {
			Object.entries(updates).forEach(([key, val]) => {
				state.filterState[key] = updates[key];
			});
		},
		toggleExpansion(state, id) {
			state.expansionState[id] = !state.expansionState[id];
		},
		toggleCheckbox(state, id) {
			state.checkboxState[id] = !state.checkboxState[id];
		},
		toggleShowComplete(state) {
			state.showCompleteState = !state.showCompleteState;
		},
		toggleShowImages(state) {
			state.showImagesState = !state.showImagesState;
		},
		setAllCheckboxes(state, updates) {
			Object.entries(updates).forEach(([key, val]) => {
				state.checkboxState[key] = val;
			});
		},
		updateLastViewed(state, id) {
			state.lastViewedState = id;
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
		setAllCheckboxesAndSave({ commit, state }, payload) {
			commit("setAllCheckboxes", payload);

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