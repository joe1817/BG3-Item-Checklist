const Filter = {
	props: ["filter"],
	template: `
<div ref="filter" class="filter main-option" @mouseover="expandSubcategories(true)" @mouseout="expandSubcategories(false)" @blur="expandSubcategories(false)">
	<div
		class="toggle-button"
		:class="{
			enabled: (filter.subfilters.length == 0 && $store.state.filterState[filter.id]) || filter.subfilters.some(sf => $store.state.filterState[sf.id]),
			'fully-enabled': (filter.subfilters.length == 0 && $store.state.filterState[filter.id]) || (filter.subfilters.length && filter.subfilters.every(sf => $store.state.filterState[sf.id]))
		}"
		@click="clickHandler($event, filter)"
	>
		<span class="eye">👁️</span>
		<span>{{ filter.id }} <span v-if="filter.subfilters.length" style="font-size:8px;line-height:1;">▼</span></span>
	</div>
	<div ref="subfilters" class="subfilters">
		<div
			v-for="subfilter in filter.subfilters"
			class="toggle-button"
			:class="{enabled: $store.state.filterState[subfilter.id], 'fully-enabled': $store.state.filterState[subfilter.id]}"
			@click="clickHandler($event, subfilter)"
		>
			<span class="eye">👁️</span>
			<span>{{ subfilter.id }}</span>
		</div>

	</div>
</div>
`,
	methods: {
		clickHandler(event, filter) {
			//alert(event.target)
			if (event.target.classList.contains("eye")) {
				this.$store.dispatch("toggleFilterAndSave", filter);
			}
			else if ((filter.subfilters && filter.subfilters.length) && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
				this.expandSubcategories(true);
				event.preventDefault(); // don't continue to process automatic mouse events
			} else {
				this.$store.dispatch("toggleFilterAndSave", filter);
			}
		},
		expandSubcategories(expand) {
			const subcategoriesDiv = this.$refs.subfilters;
			if (expand) {
				subcategoriesDiv.style.maxHeight = subcategoriesDiv.scrollHeight + "px";
			} else {
				subcategoriesDiv.style.maxHeight = "0px";
			}
		}
	}
}