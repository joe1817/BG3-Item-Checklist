const persistence = (store) => {
	// loads data from localStorage that has been stored by various names during development
	function loadCompatibleData(profile, key, _default=null) {
		let data = null;
		data = localStorage.getItem(key);
		if (data !== null) {
			localStorage.removeItem(key);
			localStorage.setItem("bg3items." + (profile ? profile + "." : "") + key, data);
			return data;
		}
		if (profile === null) {
			data = localStorage.getItem("bg3items." + key);
			if (data !== null) {
				return data;
			}
		} else {
			data = localStorage.getItem(profile + "_" + key);
			if (data !== null) {
				localStorage.removeItem(profile + "_" + key);
				localStorage.setItem("bg3items." + profile + "." + key, data);
				return data;
			}
			data = localStorage.getItem("bg3items." + profile + "." + key);
			if (data !== null) {
				return data;
			}
		}
		return _default;
	}

	const defaultShowImages = window.innerWidth > 768 ? "true" : "false";

	const activeProfile = loadCompatibleData(null, "activeProfile", "(Default)");
	const allProfiles   = loadCompatibleData(null, "allProfiles", "(Default)").split(",");

	const allShowComplete = {};
	const allShowImages   = {};
	const allLastViewed   = {};

	const allFilterState    = {};
	const allCheckboxState  = {};
	const allExpansionState = {};

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
	store.replaceState({
		...store.state,

		activeProfile     : activeProfile,
		allProfiles       : allProfiles,

		allShowComplete   : allShowComplete,
		allShowImages     : allShowImages,
		allLastViewed     : allLastViewed,

		allFilterState    : allFilterState,
		allCheckboxState  : allCheckboxState,
		allExpansionState : allExpansionState
	});




	// listen for commits
	let lastViewedTimeout = null;

	store.subscribe((mutation, state) => {
		if (mutation.type == "SET_PROFILE") {
			localStorage.setItem("bg3items.activeProfile", state.activeProfile);

		} else if (mutation.type == "CREATE_PROFILE") {
			const profileName = state.activeProfile;

			let obj = state.allProfiles
			let data = obj.join(",");
			localStorage.setItem("bg3items.allProfiles", data);
			localStorage.setItem("bg3items.activeProfile", profileName);

			const storagePrefix = "bg3items." + profileName + ".";

			localStorage.setItem(storagePrefix + "showComplete", state.allShowComplete[profileName]);
			localStorage.setItem(storagePrefix + "showImages", state.allShowImages[profileName]);
			localStorage.setItem(storagePrefix + "lastViewed", null);

			obj = state.allFilterState[profileName];
			data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem(storagePrefix + "disabled", data);
			obj = state.allCheckboxState[profileName];
			data = Object.keys(obj).filter(key => obj[key] === true).join(",");
			localStorage.setItem(storagePrefix + "checked", data);
			obj = state.allExpansionState[profileName];
			data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem(storagePrefix + "collapsed", data);

		} else if (mutation.type == "DELETE_PROFILE") {
			let obj = state.allProfiles
			let data = obj.join(",");
			localStorage.setItem("bg3items.allProfiles", data);
			localStorage.setItem("bg3items.activeProfile", state.activeProfile);

			const storagePrefix = "bg3items." + mutation.payload + ".";

			localStorage.removeItem(storagePrefix + "showComplete");
			localStorage.removeItem(storagePrefix + "showImages");
			localStorage.removeItem(storagePrefix + "lastViewed");

			localStorage.removeItem(storagePrefix + "disabled");
			localStorage.removeItem(storagePrefix + "checked");
			localStorage.removeItem(storagePrefix + "collapsed");

		} else if (mutation.type == "TOGGLE_FILTER") {
			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const obj = state.allFilterState[state.activeProfile];
			const data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem(storagePrefix + "disabled", data);

		} else if (mutation.type == "TOGGLE_EXPANSION") {
			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const obj = state.allExpansionState[state.activeProfile];
			const data = Object.keys(obj).filter(key => obj[key] === false).join(",");
			localStorage.setItem(storagePrefix + "collapsed", data);

		} else if (["TOGGLE_CHECKBOX", "SET_ALL_CHECKBOXES"].includes(mutation.type)) {
			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const obj = state.allCheckboxState[state.activeProfile];
			const data = Object.keys(obj).filter(key => obj[key] === true).join(",");
			localStorage.setItem(storagePrefix + "checked", data);

		} else if (mutation.type == "TOGGLE_SHOW_COMPLETE") {
			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const data = state.allShowComplete[state.activeProfile];
			localStorage.setItem(storagePrefix + "showComplete", data);

		} else if (mutation.type == "TOGGLE_SHOW_IMAGES") {
			const storagePrefix = "bg3items." + state.activeProfile + ".";
			const data = state.allShowImages[state.activeProfile];
			localStorage.setItem(storagePrefix + "showImages", data);

		} else if (mutation.type == "UPDATE_LAST_VIEWED") {
			const storagePrefix = "bg3items." + state.activeProfile + ".";
			clearTimeout(lastViewedTimeout);
			lastViewedTimeout = setTimeout(() => {
				let data = state.allLastViewed[state.activeProfile];
				localStorage.setItem(storagePrefix + "lastViewed", data);
			}, 1000);
		}
	});
};
