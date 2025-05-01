const EntryContainer = {
	template: `
<div
	:id="entry.id"
	:class="[(entry.entries[0].entries !== undefined) ? 'meta-container':'container', {expanded: this.$store.state.expansionState[entry.id]}]"
	v-show="$store.state.countTotal[entry.id]"
>

	<div class="header">
		<span v-if="collapsible" class="eye noselect" @click="collapseHandler">👁️</span>
		<span class="section-progress">
			<span class="title" v-html="highlight(entry.title)"></span>
			<span v-if="trackable" :class="{'progress': true, started: $store.state.countProgress[entry.id], completed: $store.state.countProgress[entry.id] == $store.state.countTotal[entry.id]} ">{{ $store.state.countProgress[entry.id] }}/{{ $store.state.countTotal[entry.id] }}</span>
		</span>
		<span v-if="clearable" class="text-button clear-button noselect" @click="clearHandler">Clear</span>
	</div>

	<div ref="content" class="content">

		<div v-if="entry.tip" class="tip" v-html="entry.tip"></div>

		<!-- the @x event handler prevents a recursion error for some reason -->
		<EntryContainer
			v-if="entry.entries[0].entries !== undefined"
			v-for="subentry in entry.entries"
			:entry="subentry"
			:parentMatchesSearch="parentMatchesSearch || entry.title.toLowerCase().includes($store.state.searchString)"
			@x=""
			@confirm="opts => $emit('confirm', opts)"
		>
		</EntryContainer>

		<Entry
			v-else
			v-for="subentry in entry.entries"
			:entry="subentry"
			:parentMatchesSearch="parentMatchesSearch || entry.title.toLowerCase().includes($store.state.searchString)"
			@x=""
		>
		</Entry>
	</div>
</div>
`,
	props: {
		entry: {},
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
		parentMatchesSearch: {
			type: Boolean,
			default: false
		}
	},
	beforeMount() {
		this.$store.state.countProgress[this.entry.id] = 0;
		this.$store.state.countTotal[this.entry.id] = 0;
	},
	mounted() {
		if (!this.$store.state.expansionState[this.entry.id]) {
			this.$refs.content.style.maxHeight = "0px";
		}
	},
	methods: {
		collapseHandler() {

			this.$refs.content.style.maxHeight = this.$refs.content.scrollHeight + "px";
			this.$refs.content.style.transition = "max-height 0.2s ease-out";

			// force a reflow
			void this.$refs.content.offsetHeight;

			const expand = !this.$store.state.expansionState[this.entry.id];
			if (expand) {
				this.$refs.content.style.maxHeight = this.$refs.content.scrollHeight + "px";
			} else {
				this.$refs.content.style.maxHeight = "0px";
			}

			this. $store.dispatch("toggleExpansionAndSave", this.entry);

			setTimeout(() => {
				this.$refs.content.style.transition = null;
				if (expand) {
					this.$refs.content.style.maxHeight = "auto";
				}
			}, 200);
		},
		clearHandler() {
			this.$emit("confirm", {
				message: "Clear all checkboxes for the section \"" + this.entry.title + "\"?",
				callback: () => {
					this.$store.dispatch("clearAllCheckboxesAndSave", this.entry);
				}
			});
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
	}
}