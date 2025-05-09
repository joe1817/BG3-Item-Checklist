const Entry = {
	template: `
<div
	ref="content"
	:id="data.id"
	:class="['entry', data.categories, data.rarity, {'top-tier': data.suggested, completed: $store.state.checkboxState[data.id], 'hide-image': !$store.state.showImagesState}]"
	v-show="visible"
	@click="handleClick($event)"
>
	<span v-if="checkbox" class="checkbox"><input type="checkbox" :checked="$store.state.checkboxState[data.id]"></span>
	<span v-if="data.img" class="img"><img :src="data.img" width=50 height=50></span>

	<template v-if="data.title">
		<template v-if="data.link">
			<span v-if="searchable" class="title"><a :href="data.link" v-html="$highlight(data.title)"></a></span>
			<span v-else class="title"><a :href="data.link" v-html="data.title"></a></span>
		</template>

		<template v-else>
			<span v-if="searchable" class="title" v-html="$highlight(data.title)"></span>
			<span v-else class="title" v-html="data.title"></span>
		</template>
	</template>

	<template v-if="data.desc">
		<span v-if="searchable" class="desc" v-html="$highlight(data.desc)"></span>
		<span v-else class="desc" v-html="data.desc"></span>
	</template>
</div>
`,
	props: {
		data: {},
		checkbox: {
			type: Boolean,
			default: true
		},
		searchable: {
			type: Boolean,
			default: true
		}
	},
	data() {
		const searchableArr = [];
		if (this.data.title)
			searchableArr.push("title");
		if (this.data.desc)
			searchableArr.push("desc");

		return {
			searchableArr: searchableArr,
		};
	},
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
			if (this.checkbox && event.target.tagName !== "A") {
				this.$store.dispatch("toggleCheckboxAndSave", this.data.id)
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
			if (this.searchable && !this.$store.state.matchesSearch[this.data.parent.id] && this.$store.state.searchString.length && !this.searchableArr.some(s => this.data[s].toLowerCase().includes(this.$store.state.searchString))) {
				return false;
			}
			if (this.$store.state.checkboxState[this.data.id] && !this.$store.state.showCompleteState) {
				return false;
			}
			if (this.data.categories !== undefined) {
				for (const cat of this.data.categories) {
					if (this.$store.state.filterState[cat] === true) {
						return true;
					}
				}
				return false;
			} else {
				return true;
			}
		},
		progress() {
			if (!this.checkbox) {
				return 0;
			}
			return (this.visible && this.$store.state.checkboxState[this.data.id]) ? 1 : 0;
		},
		total() {
			if (!this.checkbox) {
				return 0;
			}
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