const TableOfContents = {
	props: ["data"],
	template: `
<div id="TOC">
	<h2>Table of Contents</h2>
	<div class="acts" ref="acts">
		<div v-for="act in data.children" class="act">
			<h3 class="title">{{ act.title }}</h3>
			<ProgressHeader
				v-for="section in act.children"
				:id="section.id"
				:title="section.title"
				@click="clickHandlerTOC(section.id)"
			>
			</ProgressHeader>			
		</div>
		<div v-if="data.children.length % 2" ref="act-spacer" class="act" style="display:none;"></div>
	</div>
</div>
`,
	mounted() {
		// set each act in TOC to the same width
		let max = 0;
		for (const act of this.$refs.acts.children) {
			const width = act.offsetWidth+1; // add 1 to "round up"
			if (width > max) {
				max = width;
			}
		}
		for (const act of this.$refs.acts.children) {
			act.style.width = max+"px";
		}

		// add another act column when they begin to wrap so there's an even number of columns
		if (this.$refs["act-spacer"]) {
			new ResizeObserver(children => {
				const a = this.$refs.acts.children[0].getBoundingClientRect().top;
				const b = Array.from(this.$refs.acts.children).at(-2).getBoundingClientRect().top;
				if (a == b) {
					this.$refs["act-spacer"].style.display = "none";
				} else if (b > a) {
					this.$refs["act-spacer"].style.display = "block";
				}
			}).observe(this.$refs.acts);
		}
	},
	methods: {
		clickHandlerTOC(id) {
			document.getElementById(id).scrollIntoView({behavior: "smooth"});
		},
	},
}