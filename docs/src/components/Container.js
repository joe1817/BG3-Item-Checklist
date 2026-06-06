const Container = {
	template: `
<div
	:id="data.id"
	:class="[
		(data.children[0].children !== undefined) ? 'meta-container':'container',
		{expanded: expanded}
	]"
	v-show="$store.state.visible[data.id]"
>

	<div class="header">
		<div class="header-component">
			<span
				v-if="collapsible"
				:class="{
					eye      : true,
					noselect : true,
					off      : !expanded
				}"
				@click="collapseHandler"
			>👁️</span>
		</div>
		<div class="header-component">
			<ProgressHeader
				:id="data.id"
				:title="data.title"
				:trackable="trackable"
				:searchable="searchable"
			>
			</ProgressHeader>
		</div>
		<div class="header-component">
			<button
				v-if="clearable"
				v-show="$store.state.countProgress[data.id]"
				class="clear-button noselect"
				@click="clearHandler"
			>Clear</button>
		</div>
	</div>

	<div ref="content" class="content">

		<div
			v-if="data.tip"
			:class="{
				tip:true,
				'bordered-tip': true,
				'coord-wrapper': data.tip.startsWith('<span') && data.tip.length <= 50
			}"
			v-html="data.tip"
		></div>

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

	mounted() {
		if (!this.$store.getters.expansionState[this.data.id]) {
			this.$refs.content.style.maxHeight = "0px";
		}
	},

	computed: {
		expanded() {
			return this.$store.getters.expansionState[this.data.id];
		}
	},

	methods: {
		collapseHandler() {
			this.$store.dispatch("toggleExpansion", this.data.id);
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
					this.$store.dispatch("setAllCheckboxes", updates);
				}
			});
		}
	},

	watch: {
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
