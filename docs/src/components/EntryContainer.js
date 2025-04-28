const EntryContainer = {
	template: `
<div
	:id="entry.id"
	:class="[(entry.entries[0].entries !== undefined) ? 'meta-container':'container', {started: progress, completed: progress == total, expanded: this.$store.state.expansionState[entry.id]}]"
	v-show="total || preMount"
>

	<div class="header">
		<span v-if="collapsible" class="eye noselect" @click="collapseHandler">👁️</span>
		<span class="title" v-html="highlight(entry.title)"></span>
		<span v-if="trackable"  class="progress">{{ progress }}/{{ total }}</span>
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
			@updateProgress="updateProgress"
			@updateTotal="updateTotal"
			@updateHeight="updateHeight"
		>
		</EntryContainer>

		<Entry
			v-else
			v-for="subentry in entry.entries"
			:entry="subentry"
			:parentMatchesSearch="parentMatchesSearch || entry.title.toLowerCase().includes($store.state.searchString)"
			@x=""
			@updateProgress="updateProgress"
			@updateTotal="updateTotal"
			@updateHeight="updateHeight"
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
	mounted() {
		this.updateHeight(this.$refs.content.scrollHeight);
		this.preMount = false;
	},
	data() {
		return {
			progress: 0,
			total: 0,
			height: 0,
			preMount: true // needed to get correct scrollHeight during initial render
		}
	},
	methods: {
		collapseHandler() {
			this.expandContent(!this.$store.state.expansionState[this.entry.id]);
			this. $store.dispatch("toggleExpansionAndSave", this.entry);
		},
		clearHandler() {
			if (window.confirm("Clear all checkboxes for section \"" + this.entry.title + "\"?")) {	
				this.$store.dispatch("clearAllCheckboxesAndSave", this.entry);
			}
		},
		updateProgress(amount, categories) {
			this.progress += amount;
			this.$store.state.countProgress[this.entry.id] = this.progress;
			this.$emit("updateProgress", amount, categories);
		},
		updateTotal(amount, categories) {
			this.total += amount;
			this.$store.state.countTotal[this.entry.id] = this.total;
			this.$emit("updateTotal", amount, categories);
		},
		updateHeight(amount) {
			this.height += amount;
			this.expandContent(this.$store.state.expansionState[this.entry.id]);
			this.$emit("updateHeight", amount);
		},
		expandContent(expand) {
			const contentDiv = this.$refs.content;
			if (expand) {
				contentDiv.style.maxHeight = this.height + "px";
			} else {
				contentDiv.style.maxHeight = "0px";
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
	}
}