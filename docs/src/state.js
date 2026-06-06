const State = {

	plugins: [persistence],

	state() {
		return {
			activeProfile     : "(Default)",
			allProfiles       : ["(Default)"],

			allShowComplete   : {},
			allShowImages     : {},
			allLastViewed     : {},

			allFilterState    : {},
			allCheckboxState  : {},
			allExpansionState : {},

			searchString           : "",
			searchRegexp           : new RegExp(""),

			matchesSearch          : {},
			visible                : {},
			countProgress          : {},
			countTotal             : {},
		}
	},

	getters: {
		showComplete(state) {
			return state.allShowComplete[state.activeProfile];
		},

		showImages(state) {
			return state.allShowImages[state.activeProfile];
		},

		lastViewed(state) {
			return state.allLastViewed[state.activeProfile];
		},

		filterState(state) {
			return state.allFilterState[state.activeProfile];
		},

		checkboxState(state) {
			return state.allCheckboxState[state.activeProfile];
		},

		expansionState(state) {
			return state.allExpansionState[state.activeProfile];
		},
	},

	mutations: {
		UPDATE_VISIBLE(state) {
			// update matchesSearch
			const updateMatchesSearch = (data) => {
				matches = false;
				state.searchRegexp.lastIndex = 0;
				if (data.title && state.searchRegexp.test(data.title)) {
					matches = true;
				} else {
					state.searchRegexp.lastIndex = 0;
					if (data.searchableDesc && state.searchRegexp.test(data.searchableDesc)) {
						matches = true;
					}
				}
				state.matchesSearch[data.id] = matches;
				if (data.children) {
					data.children.forEach((child) => {
						updateMatchesSearch(child);
					});
				}
			}
			updateMatchesSearch(entryData);

			// update entries
			const updateEntries = (data, parentMatchesSearch) => {
				if (data.children) {
					data.children.forEach((child) => {
						updateEntries(child, parentMatchesSearch || state.matchesSearch[data.id]);
					});
				} else {
					if (data.categories) {
						let matches = false;
						for (const cat of data.categories) {
							if (state.allFilterState[state.activeProfile][cat] === true) {
								matches = true;
							}
						}
						if (!matches) {
							state.visible[data.id] = false;
							return;
						}
					}
					if (state.allCheckboxState[state.activeProfile][data.id] && !state.allShowComplete[state.activeProfile]) {
						state.visible[data.id] = false;
						return;
					}
					if (!state.matchesSearch[data.id] && !parentMatchesSearch) {
						state.visible[data.id] = false;
						return;
					}
					state.visible[data.id] = true;
					return;
				}
			}
			updateEntries(entryData);

			// update containers
			const updateContainers = (data) => {
				if (data.children) {
					state.visible[data.id] = state.matchesSearch[data.id];
					state.countProgress[data.id] = 0;
					state.countTotal[data.id] = 0;
					data.children.forEach((child) => {
						updateContainers(child);
						if (state.visible[child.id]) {
							state.visible[data.id] = true;
							state.countTotal[data.id] += (state.countTotal[child.id] || 1);
							if (state.countProgress[child.id]) {
								state.countProgress[data.id] += state.countProgress[child.id];
							} else if (state.allCheckboxState[state.activeProfile][child.id]) {
								state.countProgress[data.id] += 1;
							}
						}
					});
					if (state.countTotal[data.id] === 0) {
						state.visible[data.id] = false;
					}
				}
			}
			updateContainers(entryData);
		},

		SET_PROFILE(state, profile) {
			state.activeProfile = profile;
		},

		CREATE_PROFILE(state, profile) {
			state.allShowComplete[profile] = true;
			state.allShowImages[profile]   = window.innerWidth > 768;
			state.allLastViewed[profile]   = null;

			state.allFilterState[profile]    = {};
			state.allCheckboxState[profile]  = {};
			state.allExpansionState[profile] = {};

			const fillFilterState = (filters) => {
				for (const filter of filters) {
					state.allFilterState[profile][filter.id] = true;
					if (filter.children) {
						fillFilterState(filter.children);
					}
				}
			}
			fillFilterState(filterData);

			const fillEntryState = (entry) => {
				if (entry.children === undefined) {
					state.allCheckboxState[profile][entry.id] = false;
				} else {
					state.allExpansionState[profile][entry.id] = true;
					for (const subentry of entry.children) {
						fillEntryState(subentry);
					}
				}
			}
			fillEntryState(entryData);

			if (!state.allProfiles.includes(profile)) {
				state.allProfiles.push(profile);
			}
			state.activeProfile = profile;
 		},

		DELETE_PROFILE(state, profile) {
			state.activeProfile = "(Default)";
			state.allProfiles = state.allProfiles.filter(item => item !== profile);

			delete state.allShowComplete[profile];
			delete state.allShowImages[profile];
			delete state.allLastViewed[profile];

			delete state.allFilterState[profile];
			delete state.allCheckboxState[profile];
			delete state.allExpansionState[profile];
 		},

		TOGGLE_FILTER(state, updates) {
			Object.entries(updates).forEach(([key, val]) => {
				state.allFilterState[state.activeProfile][key] = updates[key];
			});
		},

		TOGGLE_EXPANSION(state, id) {
			state.allExpansionState[state.activeProfile][id] = !state.allExpansionState[state.activeProfile][id];
		},

		TOGGLE_CHECKBOX(state, id) {
			state.allCheckboxState[state.activeProfile][id] = !state.allCheckboxState[state.activeProfile][id];
		},

		TOGGLE_SHOW_COMPLETE(state) {
			state.allShowComplete[state.activeProfile] = !state.allShowComplete[state.activeProfile];
		},

		TOGGLE_SHOW_IMAGES(state) {
			state.allShowImages[state.activeProfile] = !state.allShowImages[state.activeProfile];
		},

		SET_ALL_CHECKBOXES(state, updates) {
			Object.entries(updates).forEach(([key, val]) => {
				state.allCheckboxState[state.activeProfile][key] = val;
			});
		},

		UPDATE_LAST_VIEWED(state, id) {
			state.allLastViewed[state.activeProfile] = id;
		},

		UPDATE_SEARCH_STRING(state, s) {
			state.searchString = s;
			const regexp = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex chars
			state.searchRegexp = new RegExp(regexp, "gi");
		}
	},

	actions: {
		setProfile({ commit, state }, payload) {
			commit("SET_PROFILE", payload);
			commit("UPDATE_VISIBLE");
		},

		createProfile({ commit, state }, payload) {
			const profileName = payload.trim();
			if (profileName === "") {
				return;
			}
			if (profileName !== "(Default)" && state.allProfiles.includes(profileName)) {
				return;
			}
			commit("CREATE_PROFILE", profileName);
			commit("UPDATE_VISIBLE");
		},

		deleteProfile({ commit, state }, payload) {
			if (payload === "(Default)") {
				// (Default) is "deleted" by calling createProfile
				return;
			}
			if (!state.allProfiles.includes(payload)) {
				return;
			}
			commit("DELETE_PROFILE", payload);
			commit("UPDATE_VISIBLE");
		},

		toggleFilter({ commit, state }, payload) {
			commit("TOGGLE_FILTER", payload);
			commit("UPDATE_VISIBLE");
		},

		toggleExpansion({ commit, state }, payload) {
			commit("TOGGLE_EXPANSION", payload);
		},

		toggleCheckbox({ commit, state }, payload) {
			commit("TOGGLE_CHECKBOX", payload);
			commit("UPDATE_VISIBLE");
		},

		toggleShowComplete({ commit, state }) {
			commit("TOGGLE_SHOW_COMPLETE");
			commit("UPDATE_VISIBLE");
		},

		toggleShowImages({ commit, state }) {
			commit("TOGGLE_SHOW_IMAGES");
		},

		setAllCheckboxes({ commit, state }, payload) {
			commit("SET_ALL_CHECKBOXES", payload);
			commit("UPDATE_VISIBLE");
		},

		updateLastViewed({ commit, state }, payload) {
			if (state.searchString || payload === state.allLastViewed[state.activeProfile]) {
				return;
			}
			commit("UPDATE_LAST_VIEWED", payload);
		},

		updateSearchString({ commit, state }, payload) {
			commit("UPDATE_SEARCH_STRING", payload);
			commit("UPDATE_VISIBLE");
		}
	}
}