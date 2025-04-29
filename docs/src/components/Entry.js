const Entry = {
	props: ["entry", "parentMatchesSearch"],
	inject: ["filters"],
	template: `
<div
	ref="content"
	:class="['entry', entry.categories, entry.rarity, {'top-tier': entry.suggested, 'completed': $store.state.checkboxState[entry.id]}]"
	:id="entry.id"
	v-show="visible"
	@click="handleClick($event)"
>
	<span class="checkbox"><input type="checkbox" :checked="$store.state.checkboxState[entry.id]"></span>
	<span v-show="$store.state.showImagesState" class="img"><img :src="entry.img" width=50 height=50></span>
	<span class="title"><a :href="entry.link" v-html="highlight(entry.title)"></a></span>
	<span class="desc" v-html="highlight(entry.desc)"></span>
</div>
`,
	mounted() {
		if (this.progress)
			this.$emit("updateProgress", 1, this.entry.categories);
		if (this.total)
			this.$emit("updateTotal", 1, this.entry.categories);
	},
	methods: {
		handleClick(event) {
			if (event.target.tagName !== "A") {
				this.$store.dispatch('toggleCheckboxAndSave', this.entry)
			}
		},
		highlight(text){
			if (!this.$store.state.searchString) {
				return text;
			} else if (text.toLowerCase().includes(this.$store.state.searchString)) {
				return highlightSubstring(text, this.$store.state.searchString)
			} else {
				return text;
			}
		}
	},
	computed: {
		visible() {
			if (!this.parentMatchesSearch && this.$store.state.searchString.length && !this.entry.desc.toLowerCase().includes(this.$store.state.searchString) && !this.entry.title.toLowerCase().includes(this.$store.state.searchString)) {
				return false;
			}
			if (this.$store.state.checkboxState[this.entry.id] && !this.$store.state.showCompleteState) {
				return false;
			}
			for (const filter of this.filters) {
				for (const cat of this.entry.categories) {
					if (filter.categories.includes(cat) && this.$store.state.filterState[filter.id]) {
						return true;
					}
				}
				for (const subfilter of filter.subfilters) {
					for (const cat of this.entry.categories) {
						if (subfilter.categories.includes(cat) && this.$store.state.filterState[subfilter.id]) {
							return true;
						}
					}
				}
			}
			return false;
		},
		progress() {
			return (this.visible && this.$store.state.checkboxState[this.entry.id]) ? 1 : 0;
		},
		total() {
			return (this.visible) ? 1 : 0;
		}
	},
	watch: {
		progress(newVal, oldVal) {
			this.$emit("updateProgress", newVal-oldVal, this.entry.categories);
		},
		total(newVal, oldVal) {
			this.$emit("updateTotal", newVal-oldVal, this.entry.categories);
		}
	}
}