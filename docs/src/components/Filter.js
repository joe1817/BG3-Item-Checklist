const Filter = {
	props: ["filter"],
	template: `
<div
	ref="filter"
	:id="'filter-'+filter.id"
	class="filter main-option"
	@mouseenter="mouseenterHandler"
	@mouseleave="mouseleaveHandler"
>
	<button
		class="toggle-button"
		:class="{
			off: !$store.getters.filterState[filter.id] || (filter.children && filter.children.some(sf => !$store.getters.filterState[sf.id]))
		}"
		@click="clickHandler($event, filter)"
	>
		<span
			:class="{
				eye: true,
				off: (!filter.children && !$store.getters.filterState[filter.id]) || (filter.children && filter.children.every(sf => !$store.getters.filterState[sf.id]))
			}"
		>👁️</span>
		<span>{{ filter.title }} <span v-if="filter.children" style="font-size:8px;line-height:1;">▼</span></span>
	</button>
	<div ref="subfilters" class="subfilters">
		<button
			v-for="subfilter in filter.children"
			class="toggle-button"
			:class="{
				off: !$store.getters.filterState[subfilter.id]
			}"
			@click="clickHandler($event, subfilter)"
		>
			<span class="arrow">↳</span>
			<span
				:class="{
					eye: true,
					off: !$store.getters.filterState[subfilter.id]
				}"
			>👁️</span>
			<span>{{ subfilter.title }}</span>
		</button>
	</div>
</div>
`,
	data() {
		return {
			expanded: false,
			touch: window.matchMedia("(pointer: coarse)").matches
		}
	},
	methods: {
		clickHandler(event, filter) {
			if (
				this.touch
				&& !event.target.classList.contains("eye")
				&& filter.children !== undefined
				&& filter.parent === undefined // the UI only supports 1 level of expansion at the moment
			) {
				this.expanded = !this.expanded;
			} else {
				const updates = {};
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
				this.$store.dispatch("toggleFilter", updates);
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
				this.$emit("expanded", "filter-"+this.filter.id, true);
			} else {
				subcategoriesDiv.style.maxHeight = "0px";
				this.$emit("expanded", "filter-"+this.filter.id, false);
			}
		}
	}
}