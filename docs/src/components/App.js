const App = {
	template: `
<ScrollToTop	
	class="text-button noselect"
></ScrollToTop>

<h1>BG3 Item Checklist</h1>
<p><a href="https://github.com/joe1817/BG3-Item-Checklist">GitHub</a></p>

<TableOfContents
	:data="entryData"
></TableOfContents>

<Options
	:filterData="filterData"
></Options>

<div id="checklist">
	<DefaultContainer
		:data="entryData"
		:collapsible=false
	></DefaultContainer>
</div>
`,
	data() {
		return {
			entryData  : entryData,
			filterData : filterData
		};
	},
	mounted() {
		// scroll to last viewed section
		if (this.$store.state.lastViewedState) {
			const lastViewed = this.$store.state.lastViewedState;
			const yPos = window.scrollY;
			setTimeout(() => {
				if (window.scrollY == yPos) {
					document.getElementById(lastViewed).scrollIntoView({ behavior: "smooth" });
				}
			}, 1000);
		}

		// keep track of last viewed section
		const containers = document.querySelectorAll("#checklist .container > .header");
		const observer = new IntersectionObserver(
			(sections) => {
				sections.forEach((section) => {
					if (section.isIntersecting) {
						let id = "TOC";
						if (section.target.id !== "TOC") {
							id = section.target.parentNode.id;
						}
						this.$store.dispatch("updateLastViewedAndSave", id)
					}
				});
			},
			{
				threshold: 0,
				rootMargin: "0px 0px -80%",
			}
		);
		containers.forEach((section) => {
			observer.observe(section);
		});
		observer.observe(document.getElementById("TOC"));

		// replace image links with coordinates in the spritesheet
		loadSprites();

		// calculate buy prices from values
		document.querySelectorAll(".value").forEach(value => {
			value.innerText = this.get_final_price(value.innerText);
		});
	},
	methods: {
		get_difficulty_mod(difficulty) {
			switch (difficulty) {
				case "explorer": return 0.5;
				case "balanced": return 0;
				case "tactician": return -0.5;
				case "honour": return -0.5;
			}
		},
		//See https://bg3.wiki/wiki/Trading_and_item_pricing and https://bg3.wiki/wiki/Widget:PriceCalculator
		get_final_price(value, persuasion_mod = 4, attitude = 0, difficulty = "balanced") {
			let difficulty_mod = this.get_difficulty_mod(difficulty);
			let price_mod = Math.max(1.0, 2.5 - 0.1*persuasion_mod - 0.005*attitude - difficulty_mod);
			value = value.split(" / ");
			if (value.length == 1 || difficulty != "honour")
				value = value[0];
			else
				value = value[1];
			value = parseInt(value.replace(" gp", ""));
			let price_buy = Math.round(value * price_mod);
			return price_buy + " gp";
		}
	}
}