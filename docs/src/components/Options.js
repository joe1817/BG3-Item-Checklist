const Options = {
	props: ["filterData"],
	template: `
<div id="options" ref="options">
	<fieldset id="filters" class="noselect">
		<legend>Filters</legend>
		<div class="content">
			<Filter
				ref="filters"
				v-for="filter in filterData"
				:filter="filter"
				@expanded="expandHandler"
			></Filter>
		</div>
	</fieldset>

	<fieldset id="more-options" class="noselect">
		<legend>More Options</legend>
		<div class="content">
			<button class="toggle-button main-option"
				:class="{
					'toggle-button': true,
					off: !$store.getters.showComplete
				}"
				@click="$store.dispatch('toggleShowComplete')"
			>
				<span
					:class="{
						eye: true,
						off: !$store.getters.showComplete
					}"
				>👁️</span>
				<span>Show Completed</span>
			</button>
			<button class="toggle-button main-option"
				:class="{
					'toggle-button': true,
					off: !$store.getters.showImages
				}"
				@click="$store.dispatch('toggleShowImages')"
			>
				<span
					:class="{
						eye: true,
						off: !$store.getters.showImages
					}"
				>👁️</span>
				<span>Show Images</span>
			</button>
		</div>
	</fieldset>

	<fieldset id="search">
		<legend>Search</legend>
		<div class="content">
			<div class="main-option search-input-wrapper">
				<input
					type="text"
					ref="searchBar"
					class="search-input"
					@keyup ="keyupHandler($event)"
					placeholder="..."
				>
				<button class="clear-button" @click="clearSearchHandler">Clear</button>
			</div>
		</div>
	</fieldset>
</div>
`,
	beforeMount() {
		const scan = (filter) => {
			filter.descendants = [filter.id];
			if (filter.children) {
				filter.children.forEach(child => {
					scan(child);
					child.parent = filter;
					filter.descendants.push(...child.descendants);
				});
			}
		};
		this.filterData.forEach(filter => {
			scan(filter);
		});
	},
	methods: {
		clearSearchHandler() {
			this.$refs.searchBar.value="";
			this.$store.dispatch("updateSearchString", "");
		},
		keyupHandler(event) {
			if (event.key == "Escape") {
				this.clearSearchHandler();
			} else {
				this.$store.dispatch("updateSearchString", event.target.value.toLowerCase());
			}
		},
		expandHandler(filter, expanded) {
			const fade = (el, id) => {
				if (el.getAttribute("id") == id) {
					return true;
				}
				let found = null;
				for (const child of el.children) {
					if (fade(child, id)) {
						found = child;
						break;
					}
				}
				if (found) {
					for (const child of el.children) {
						if (child !== found) {
							child.classList.add("faded");
						}
					}
					return true;
				}
				return false;
			};

			const unfade = (el) => {
				el.classList.remove("faded");
				for (const child of el.children) {
					unfade(child);
				}
			};

			if (expanded) {
				fade(this.$refs.options, filter);
			} else {
				unfade(this.$refs.options);
			}
		},
	},
}