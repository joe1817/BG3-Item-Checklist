const Filter = {
	props: ["filter"],
	template: `
<div ref="filter" :id="'filter-'+filter.id" class="filter main-option" @mouseenter="mouseenterHandler" @mouseleave="mouseleaveHandler">
	<div
		class="toggle-button"
		:class="{
			enabled: (!filter.children && $store.getters.filterState[filter.id]) || (filter.children && filter.children.some(sf => $store.getters.filterState[sf.id])),
			'fully-enabled': (!filter.children && $store.getters.filterState[filter.id]) || (filter.children && filter.children.every(sf => $store.getters.filterState[sf.id]))
		}"
		@click="clickHandler($event, filter)"
	>
		<span class="eye">👁️</span>
		<span>{{ filter.title }} <span v-if="filter.children" style="font-size:8px;line-height:1;">▼</span></span>
	</div>
	<div ref="subfilters" class="subfilters">
		<div
			v-for="subfilter in filter.children"
			class="toggle-button"
			:class="{enabled: $store.getters.filterState[subfilter.id], 'fully-enabled': $store.getters.filterState[subfilter.id]}"
			@click="clickHandler($event, subfilter)"
		>
			<span class="arrow">↳</span>
			<span class="eye">👁️</span>
			<span>{{ subfilter.title }}</span>
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
			if (this.touch && !event.target.classList.contains("eye") && (filter.children && filter.children.length)) {
				this.expanded = !this.expanded;
			} else {
				updates = {};
				updates[filter.id] = !this.$store.getters.filterState[filter.id];
				for (const id of filter.descendants) {
					updates[id] = updates[filter.id];
				}
				if (filter.parent !== undefined) {
					const count = filter.parent.children.filter(sf => updates[sf.id] ?? this.$store.getters.filterState[sf.id] ?? true).length;
					if (count == filter.parent.children.length) {
						updates[filter.parent.id] = true;
					} else {
						updates[filter.parent.id] = false;
					}
				}
				this.$store.dispatch("toggleFilterAndSave", updates);
			}
		},
		mouseenterHandler() {
			const canExpand = this.filter.children && this.filter.children.length;
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