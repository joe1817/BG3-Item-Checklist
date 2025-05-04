const Entry = {
	props: ["data"],
	inject: ["filters"],
	template: `
<div
	ref="content"
	:class="['entry', data.categories, data.rarity, {'top-tier': data.suggested, 'completed': $store.state.checkboxState[data.id]}]"
	:id="data.id"
	v-show="visible"
	@click="handleClick($event)"
>
	<span class="checkbox"><input type="checkbox" :checked="$store.state.checkboxState[data.id]"></span>
	<span v-show="$store.state.showImagesState" class="img"><img :src="data.img" width=50 height=50></span>
	<span class="title"><a :href="data.link" v-html="$highlight(data.title)"></a></span>
	<span class="desc" v-html="$highlight(data.desc)"></span>
</div>
`,
	mounted() {
		if (this.progress) {
			this.updateProgress(1);
		}
		if (this.total) {
			this.updateTotal(1);
		}
	},
	methods: {
		handleClick(event) {
			if (event.target.tagName !== "A") {
				this.$store.dispatch("toggleCheckboxAndSave", this.data)
			}
		},
		updateProgress(amount) {
			let parent = this.data.parent;
			while (parent) {
				this.$store.state.countProgress[parent.id] += amount;
				parent = parent.parent;
			}
		},
		updateTotal(amount) {
			let parent = this.data.parent;
			while (parent) {
				this.$store.state.countTotal[parent.id] += amount;
				parent = parent.parent;
			}
		}
	},
	computed: {
		visible() {
			if (!this.$store.state.matchesSearch[this.data.parent.id] && this.$store.state.searchString.length && !this.data.desc.toLowerCase().includes(this.$store.state.searchString) && !this.data.title.toLowerCase().includes(this.$store.state.searchString)) {
				return false;
			}
			if (this.$store.state.checkboxState[this.data.id] && !this.$store.state.showCompleteState) {
				return false;
			}
			for (const filter of this.filters) {
				for (const cat of this.data.categories) {
					if (filter.categories.includes(cat) && this.$store.state.filterState[filter.id]) {
						return true;
					}
				}
				for (const subfilter of filter.subfilters) {
					for (const cat of this.data.categories) {
						if (subfilter.categories.includes(cat) && this.$store.state.filterState[subfilter.id]) {
							return true;
						}
					}
				}
			}
			return false;
		},
		progress() {
			return (this.visible && this.$store.state.checkboxState[this.data.id]) ? 1 : 0;
		},
		total() {
			return (this.visible) ? 1 : 0;
		}
	},
	watch: {
		progress(newVal, oldVal) {
			this.$nextTick(() => {
				this.updateProgress(newVal-oldVal);
			});
		},
		total(newVal, oldVal) {
			this.$nextTick(() => {
				this.updateTotal(newVal-oldVal);
			});
		}
	}
}