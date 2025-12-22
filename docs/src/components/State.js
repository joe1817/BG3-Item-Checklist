const State = {
	state() {
		// loads data from localStorage that has been stored by various names during development
		function loadCompatibleData(activeProfile, key, _default=null) {
			let data = null;
			data = localStorage.getItem(key);
			if (data !== null) {
				localStorage.removeItem(key);
				localStorage.setItem("bg3items." + (activeProfile ? activeProfile + "." : "") + key, data);
				return data;
			}
			if (activeProfile === null) {
				data = localStorage.getItem("bg3items." + key);
				if (data !== null) {
					return data;
				}
			} else {
				data = localStorage.getItem(activeProfile + "_" + key);
				if (data !== null) {
					localStorage.removeItem(activeProfile + "_" + key);
					localStorage.setItem("bg3items." + activeProfile + "." + key, data);
					return data;
				}
				data = localStorage.getItem("bg3items." + activeProfile + "." + key);
				if (data !== null) {
					return data;
				}
			}
			return _default;
		}

		const defaultShowImages = window.innerWidth > 768 ? "true" : "false";

		const activeProfile = loadCompatibleData(null, "activeProfile", "(Default)");
		const allProfiles   = loadCompatibleData(null, "allProfiles", "(Default)").split(",");

		const allShowComplete = {}
		const allShowImages   = {}
		const allLastViewed   = {}

		const allFilterState    = {}
		const allCheckboxState  = {}
		const allExpansionState = {}

		for (const profile of allProfiles) {
			allShowComplete[profile] = loadCompatibleData(profile, "showComplete", "true") == "true";
			allShowImages[profile]   = loadCompatibleData(profile, "showImages", defaultShowImages) == "true";
			allLastViewed[profile]   = loadCompatibleData(profile, "lastViewed");

			disabled  = loadCompatibleData(profile, "disabled", "").split(",");
			checked   = loadCompatibleData(profile, "checked", "").split(",");
			collapsed = loadCompatibleData(profile, "collapsed", "").split(",");

			allFilterState[profile]    = {};
			allCheckboxState[profile]  = {};
			allExpansionState[profile] = {};

			const fillFilterState = (filters) => {
				for (const filter of filters) {
					allFilterState[profile][filter.id] = !disabled.includes(filter.id);
					if (filter.children) {
						fillFilterState(filter.children);
					}
				}
			}
			fillFilterState(filterData);

			const fillEntryState = (entry) => {
				if (entry.children === undefined) {
					allCheckboxState[profile][entry.id] = checked.includes(entry.id);
				} else {
					allExpansionState[profile][entry.id] = !collapsed.includes(entry.id);
					for (const subentry of entry.children) {
						fillEntryState(subentry);
					}
				}
			}
			fillEntryState(entryData);
		}

		return {
			// profiles
			activeProfile : activeProfile,
			allProfiles   : allProfiles,

			allShowComplete : allShowComplete,
			allShowImages   : allShowImages,
			allLastViewed   : allLastViewed,

			allFilterState    : allFilterState,
			allCheckboxState  : allCheckboxState,
			allExpansionState : allExpansionState,

			lastViewedWritePending : false, // scrolling too fast can cause too many writes, limit the rate
			searchString           : "",
			matchesSearch          : {},
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
		setProfile(state, profile) {
			state.activeProfile = profile;
		},
		createProfile(state, profile) {
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
		deleteProfile(state, profile) {
			state.activeProfile = "(Default)";
			state.allProfiles = state.allProfiles.filter(item => item !== profile);

			delete state.allShowComplete[profile];
			delete state.allShowImages[profile];
			delete state.allLastViewed[profile];

			delete state.allFilterState[profile];
			delete state.allCheckboxState[profile];
			delete state.allExpansionState[profile];
 		},
		toggleFilter(state, updates) {
			Object.entries(updates).forEach(([key, val]) => {
				state.allFilterState[state.activeProfile][key] = updates[key];
			});
		},
		toggleExpansion(state, id) {
			state.allExpansionState[state.activeProfile][id] = !state.allExpansionState[state.activeProfile][id];
		},
		toggleCheckbox(state, id) {
			state.allCheckboxState[state.activeProfile][id] = !state.allCheckboxState[state.activeProfile][id];
		},
		toggleShowComplete(state) {
			state.allShowComplete[state.activeProfile] = !state.allShowComplete[state.activeProfile];
		},
		toggleShowImages(state) {
			state.allShowImages[state.activeProfile] = !state.allShowImages[state.activeProfile];
		},
		setAllCheckboxes(state, updates) {
			Object.entries(updates).forEach(([key, val]) => {
				state.allCheckboxState[state.activeProfile][key] = val;
			});
		},
		updateLastViewed(state, id) {
			state.allLastViewed[state.activeProfile] = id;
		},
		updateSearchString(state, s) {
			state.searchString = s;
		}
	},

	actions: {
		setProfileAndSave({ commit, state }, payload) {
			commit("setProfile", payload);

			localStorage.setItem("bg3items.activeProfile", state.activeProfile);
		},
		createProfileAndSave({ commit, state }, payload) {
			if (payload.trim() === "") {
				return;
			}

			commit("createProfile", payload);

			let obj = state.allProfiles
			let data = obj.join(",");
			localStorage.setItem("bg3items.allProfiles", data);
			localStorage.setItem("bg3items.activeProfile", state.activeProfile);

			const storagePrefix = "bg3items." + state.activeProfile + ".";

			localStorage.setItem(storagePrefix + "showComplete", state.allShowComplete[state.activeProfile]);
			localStorage.setItem(storagePrefix + "showImages", state.allShowImages[state.activeProfile]);
			localStorage.setItem(storagePrefix + "lastViewed", null);

			obj = state.allFilterState[state.activeProfile];
			data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem(storagePrefix + "disabled", data);
			obj = state.allCheckboxState[state.activeProfile];
			data = Object.keys(obj).filter(key => obj[key] === true).join(",");
			localStorage.setItem(storagePrefix + "checked", data);
			obj = state.allExpansionState[state.activeProfile];
			data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem(storagePrefix + "collapsed", data);
		},
		deleteProfileAndSave({ commit, state }, payload) {
			if (payload === "(Default)") {
				return;
			}

			commit("deleteProfile", payload);

			let obj = state.allProfiles
			let data = obj.join(",");
			localStorage.setItem("bg3items.allProfiles", data);
			localStorage.setItem("bg3items.activeProfile", state.activeProfile);

			const storagePrefix = "bg3items." + payload + ".";

			localStorage.removeItem(storagePrefix + "showComplete");
			localStorage.removeItem(storagePrefix + "showImages");
			localStorage.removeItem(storagePrefix + "lastViewed");

			localStorage.removeItem(storagePrefix + "disabled");
			localStorage.removeItem(storagePrefix + "checked");
			localStorage.removeItem(storagePrefix + "collapsed");
		},
		toggleFilterAndSave({ commit, state }, payload) {
			commit("toggleFilter", payload);

			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const obj = state.allFilterState[state.activeProfile];
			const data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem(storagePrefix + "disabled", data);
		},
		toggleExpansionAndSave({ commit, state }, payload) {
			commit("toggleExpansion", payload);

			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const obj = state.allExpansionState[state.activeProfile];
			const data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem(storagePrefix + "collapsed", data);
		},
		toggleCheckboxAndSave({ commit, state }, payload) {
			commit("toggleCheckbox", payload);

			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const obj = state.allCheckboxState[state.activeProfile];
			const data = Object.keys(obj).filter(key => obj[key] === true).join(",");
			localStorage.setItem(storagePrefix + "checked", data);
		},
		toggleShowCompleteAndSave({ commit, state }) {
			commit("toggleShowComplete");

			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const data = state.allShowComplete[state.activeProfile];
			localStorage.setItem(storagePrefix + "showComplete", data);
		},
		toggleShowImagesAndSave({ commit, state }) {
			commit("toggleShowImages");

			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const data = state.allShowImages[state.activeProfile];
			localStorage.setItem(storagePrefix + "showImages", data);
		},
		setAllCheckboxesAndSave({ commit, state }, payload) {
			commit("setAllCheckboxes", payload);

			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const obj = state.allCheckboxState[state.activeProfile];
			const data = Object.keys(obj).filter(key => obj[key] === true).join(",");
			localStorage.setItem(storagePrefix + "checked", data);
		},
		updateLastViewedAndSave({ commit, state }, payload) {
			if (state.searchString || payload === state.allLastViewed[state.activeProfile]) {
				return;
			}

			commit("updateLastViewed", payload);

			const storagePrefix = "bg3items." + state.activeProfile + ".";
			if (!state.lastViewedWritePending) {
				state.lastViewedWritePending = true;
				setTimeout(() => {
					let data = state.allLastViewed[state.activeProfile];
					localStorage.setItem(storagePrefix + "lastViewed", data);
					state.lastViewedWritePending = false;
				}, 2000);
			}
		}
	}
}