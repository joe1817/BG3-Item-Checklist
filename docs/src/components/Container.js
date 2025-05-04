const Container = {
	template: `
<div
	:id="data.id"
	:class="[(data.children[0].children !== undefined) ? 'meta-container':'container', {expanded: $store.state.expansionState[data.id]}]"
	v-show="!autoHide || !trackable || $store.state.countTotal[data.id]"
>

	<div class="header">
		<span v-if="collapsible" class="eye noselect" @click="collapseHandler">👁️</span>
		<span class="section-progress">
			<span v-if="searchable" class="title" v-html="$highlight(data.title)"></span>
			<span v-else class="title">{{ data.title }}</span>
			<span v-if="trackable"
				:class="{
					'progress': true,
					started: $store.state.countProgress[data.id],
					completed: $store.state.countProgress[data.id] == $store.state.countTotal[data.id]}"
			>{{ $store.state.countProgress[data.id] }}/{{ $store.state.countTotal[data.id] }}
			</span>
		</span>
		<span v-if="clearable" class="text-button clear-button noselect" @click="clearHandler">Clear</span>
	</div>

	<div ref="content" class="content">

		<div v-if="data.tip" class="tip" v-html="data.tip"></div>

		<slot
			name="nestedContainer"
			v-if="data.children[0].children !== undefined"
			v-for="subdata in data.children"
			:data="subdata"
		>
		</slot>

		<slot
			name="leaf"
			v-else
			v-for="subdata in data.children"
			:data="subdata"
		>
		</slot>
	</div>
</div>
`,
	props: {
		data: {},
		autoHide: {
			type: Boolean,
			default: true
		},
		collapsible: {
			type: Boolean,
			default: true
		},
		trackable: {
			type: Boolean,
			default: true
		},
		clearable: {
			type: Boolean,
			default: true
		},
		searchable: {
			type: Boolean,
			default: true
		}
	},
	beforeMount() {
		this.$store.state.countProgress[this.data.id] = 0;
		this.$store.state.countTotal[this.data.id] = 0;
		this.$store.state.matchesSearch[this.data.id] = true;
	},
	mounted() {
		if (!this.$store.state.expansionState[this.data.id]) {
			this.$refs.content.style.maxHeight = "0px";
		}
	},
	computed: {
		parentMatchesSearch() {
			return this.data.parent && this.$store.state.matchesSearch[this.data.parent.id];
		},
		matchesSearch() {
			return this.parentMatchesSearch || (this.searchable && this.data.title.toLowerCase().includes(this.$store.state.searchString));
		}
	},
	methods: {
		collapseHandler() {

			this.$refs.content.style.maxHeight = this.$refs.content.scrollHeight + "px";
			this.$refs.content.style.transition = "max-height 0.2s ease-out";

			// force a reflow
			void this.$refs.content.offsetHeight;

			const expand = !this.$store.state.expansionState[this.data.id];
			if (expand) {
				this.$refs.content.style.maxHeight = this.$refs.content.scrollHeight + "px";
			} else {
				this.$refs.content.style.maxHeight = "0px";
			}

			this.$store.dispatch("toggleExpansionAndSave", this.data);

			setTimeout(() => {
				this.$refs.content.style.transition = null;
				if (expand) {
					this.$refs.content.style.maxHeight = "auto";
				}
			}, 200);
		},
		clearHandler() {
			this.$confirm(
				"Clear all checkboxes for the section \"" + this.data.title + "\"?",
				() => {
					this.$store.dispatch("clearAllCheckboxesAndSave", this.data);
				}
			);
		}
	},
	watch: {
		matchesSearch(newVal, oldVal) {
			this.$store.state.matchesSearch[this.data.id] = newVal;
		}
	}
}