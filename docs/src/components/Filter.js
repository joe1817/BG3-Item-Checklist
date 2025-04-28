const Filter = {
	props: ["filter"],
	template: `
<div ref="filter" :name="filter.id" class="filter main-option" @mouseenter="mouseenterHandler" @mouseleave="mouseleaveHandler">
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
			<span class="arrow">↳</span>
			<span class="eye">👁️</span>
			<span>{{ subfilter.id }}</span>
		</div>
	</div>
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
		mouseenterHandler(){
			if (!this.touch) {
				this.expanded = true;
			}
		},
		mouseleaveHandler(){
			this.expanded = false;
		}
	},
	watch: {
		expanded(expand) {
			const subcategoriesDiv = this.$refs.subfilters;
			if (expand) {
				subcategoriesDiv.style.maxHeight = subcategoriesDiv.scrollHeight + "px";
				this.$emit("expanded", this.filter);
			} else {
				subcategoriesDiv.style.maxHeight = "0px";
				this.$emit("expanded", null);
			}
		}
	}
}