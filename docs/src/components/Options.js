const Filter = {
	props: ["filters"],
	template: `
<div id="options" ref="options">
	<fieldset id="filters" class="noselect">
		<legend>Filters</legend>
		<div class="content">
			<Filter ref="filters" v-for="filter in filters" :filter="filter" @expanded="expandHandler"></Filter>
		</div>
	</fieldset>

	<fieldset id="more-options" class="noselect">
		<legend>More Options</legend>
		<div class="content">
			<div class="toggle-button main-option"
				:class="{enabled: $store.state.showCompleteState, 'fully-enabled': $store.state.showCompleteState}"
				@click="$store.dispatch('toggleShowCompleteAndSave')"
			>
				<span class="eye">👁️</span>
				<span>Show Completed</span>
			</div>
			<div class="toggle-button main-option"
				:class="{enabled: $store.state.showImagesState, 'fully-enabled': $store.state.showImagesState}"
				@click="$store.dispatch('toggleShowImagesAndSave')"
			>
				<span class="eye">👁️</span>
				<span>Show Images</span>
			</div>
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
					placeholder="Search..."
				>
				<div id="clear-button" class="text-button" @click="clearSearchHandler">Clear</div>
			</div>
		</div>
	</fieldset>
</div>
`,
	data() {
		return {
			expanded: false,
			touch: "ontouchstart" in window || navigator.maxTouchPoints > 0
		}
	},
	methods: {
		clickHandler(event, filter) {
			if (this.touch) {
				if (event.target.classList.contains("eye")) {
					this.$store.dispatch("toggleFilterAndSave", filter);
				} else if ((filter.subfilters && filter.subfilters.length)) {
					this.expanded = !this.expanded;
				} else {
					this.$store.dispatch("toggleFilterAndSave", filter);
				}
			} else {
				this.$store.dispatch("toggleFilterAndSave", filter);
			}
		},
		mouseenterHandler() {
			const canExpand = this.filter.subfilters && this.filter.subfilters.length;
			if (!this.touch && canExpand) {
				this.expanded = true;
			}
		},
		mouseleaveHandler() {
			this.expanded = false;
		}
	},
	watch: {
		expanded(expand) {
			const subcategoriesDiv = this.$refs.subfilters;
			if (expand) {
				subcategoriesDiv.style.maxHeight = subcategoriesDiv.scrollHeight + "px";
				this.$emit("expanded", 'filter-'+this.filter.id, true);
			} else {
				subcategoriesDiv.style.maxHeight = "0px";
				this.$emit("expanded", 'filter-'+this.filter.id, false);
			}
		}
	}
}