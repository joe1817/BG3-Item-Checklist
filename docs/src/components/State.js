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

		for (const filter of filters) {
			filterState[filter.id] = !disabled.includes(filter.id);
			for (const subfilter of filter.subfilters) {
				filterState[subfilter.id] = !disabled.includes(subfilter.id);
			}
		}

		const fillState = (entry) => {
			if (entry.entries === undefined) {
				checkboxState[entry.id] = checked.includes(entry.id);
			} else {
				expansionState[entry.id] = !collapsed.includes(entry.id);
				for (const subentry of entry.entries) {
					fillState(subentry);
				}
			}
		}
		fillState(entryData);

		return {
			filterState: filterState,
			expansionState: expansionState,
			checkboxState: checkboxState,
			showCompleteState: showComplete,
			showImagesState: showImages,
			lastViewedState: lastViewed,

			lastViewedWritePending: false, // scrolling too fast can cause too many writes, limit the rate
			searchString: "",
			matchesSearch: {},
			countProgress: {},
			countTotal: {}
		}
	},
	mutations: {
		toggleFilter(state, filter) {
			state.filterState[filter.id] = !state.filterState[filter.id];

			if (filter.parent === undefined) {
				for (const subfilter of filter.subfilters) {
					state.filterState[subfilter.id] = state.filterState[filter.id];
				}
			} else {
				const count = filter.parent.subfilters.filter(sf => state.filterState[sf.id]).length;
				if (count == filter.parent.subfilters.length) {
					state.filterState[filter.parent.id] = true;
				} else {
					state.filterState[filter.parent.id] = false;
				}
			}
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
				for (const entry of container.entries) {
					if (entry.entries === undefined) {
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