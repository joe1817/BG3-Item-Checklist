const Container = {
	template: `
<div
	:id="data.id"
	:class="[(data.children[0].children !== undefined) ? 'meta-container':'container', {expanded: $store.getters.expansionState[data.id]}]"
	v-show="!autoHide || !trackable || $store.state.countTotal[data.id]"
>

	<div class="header">
		<span v-if="collapsible" class="eye noselect" @click="collapseHandler">👁️</span>
		<ProgressHeader
			:id="data.id"
			:title="data.title"
			:trackable="trackable"
			:searchable="searchable"
		>
		</ProgressHeader>
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
		if (this.data.children) {
			this.data.children.forEach(child => {
				child.parent = this.data;
			});
		}
		this.$store.state.countProgress[this.data.id] = 0;
		this.$store.state.countTotal[this.data.id] = 0;
		this.$store.state.matchesSearch[this.data.id] = true;
	},
	mounted() {
		if (!this.$store.getters.expansionState[this.data.id]) {
			this.$refs.content.style.maxHeight = "0px";
		}
	},
	computed: {
		parentMatchesSearch() {
			return this.data.parent && this.$store.state.matchesSearch[this.data.parent.id];
		},
		matchesSearch() {
			this.$store.state.searchRegexp.lastIndex = 0;
			return this.parentMatchesSearch || (this.searchable && this.$store.state.searchRegexp.test(this.data.title));
		},
		expanded() {
			return this.$store.getters.expansionState[this.data.id];
		}
	},
	methods: {
		collapseHandler() {
			this.$store.dispatch("toggleExpansionAndSave", this.data.id);
		},
		clearHandler() {
			this.$confirm({
				prompt    : "Clear all checkboxes for this section?",
				selection : this.data.title,
				onOK      : () => {
					updates = {};
					const scan = (data) => {
						for (const child of data.children) {
							if (child.children === undefined) {
								updates[child.id] = false;
							} else {
								scan(child);
							}
						}
					}
					scan(this.data);
					this.$store.dispatch("setAllCheckboxesAndSave", updates);
				}
			});
		}
	},
	watch: {
		matchesSearch(newVal, oldVal) {
			this.$store.state.matchesSearch[this.data.id] = newVal;
		},
		expanded(newVal, oldVal) {
			if (newVal) {
				requestAnimationFrame(() => {
					this.$refs.content.style.maxHeight = this.$refs.content.scrollHeight + "px";
				});
				this.$refs.content.addEventListener("transitionend", () => {
					this.$refs.content.style.maxHeight = null;
				}, { once: true });
			} else {
				this.$refs.content.style.maxHeight = this.$refs.content.scrollHeight + "px";
				// need two requestAnimationFrame()'s to stop the browser from optimizing away the intermediate value above
				// void this.$refs.content.offsetHeight; // also works by forcing a reflow & "flushing" CSS changes to the browser
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						this.$refs.content.style.maxHeight = "0px";
					});
				});
			}
		}
	}
}
