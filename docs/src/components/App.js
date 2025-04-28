const App = {
	template: `
<div id="back-to-top" class="text-button noselect" @click="scrollToTop">Back to Top</div>

<h1>BG3 Item Checklist</h1>
<p><a href="https://github.com/joe1817/BG3-Item-Checklist">GitHub</a></p>

<div id="TOC">
	<h2>Table of Contents</h2>
	<div class="acts">
		<div v-for="act in entryData.entries" class="act" ref="act">
			<h3 class="title">{{ act.title }}</h3>
			<div v-for="section in act.entries" :class="['section', {started: $store.state.countProgress[section.id], completed: $store.state.countProgress[section.id] == $store.state.countTotal[section.id], active: $store.state.countTotal[section.id]}]">
				<a v-if="$store.state.countTotal[section.id]" :href="'#'+section.id">{{ section.title }}</a>
				<span v-else>{{ section.title }}</span>
				<span><span class="progress">{{ $store.state.countProgress[section.id] }}/{{ $store.state.countTotal[section.id] }}</span></span>
			</div>
		</div>
	</div>
</div>

<div id="options">
<fieldset id="filters" class="noselect">
	<legend>Filters</legend>
	<div class="content">
		<Filter v-for="filter in filters" :filter="filter"></Filter>
	</div>
</fieldset>

<fieldset id="more-options" class="noselect">
	<legend>More Options</legend>
	<div class="content">
		<div class="toggle-button main-option"
			:class="{enabled: $store.state.showCompleteState, 'fully-enabled': $store.state.showCompleteState}"
			@click="$store.dispatch('toggleShowCompleteAndSave')"
		>
			<span class="eye">👁️</span>
			<span>Show Completed</span>
		</div>
		<div class="toggle-button main-option"
			:class="{enabled: $store.state.showImagesState, 'fully-enabled': $store.state.showImagesState}"
			@click="$store.dispatch('toggleShowImagesAndSave')"
		>
			<span class="eye">👁️</span>
			<span>Show Images</span>
		</div>
	</div>
</fieldset>

<fieldset id="search">
	<legend>Search</legend>
	<div class="content">
		<div class="search-input-wrapper">
			<input
				type="text"
				ref="searchBar"
				class="search-input main-option"
				@keyup ="keyupHandler($event)"
				placeholder="Search..."
			>
			<div class="clear-button" @click="clearSearchHandler">×</div>
		</div>
	</div>
</fieldset>
</div>

<div id="table">
<EntryContainer
	:entry="entryData"
	:collapsible=false
	@clearCheckboxes="$store.dispatch('clearAllCheckboxesAndSave', entryData)"
>
</EntryContainer>
</div>
`,
	data() {
		return {
			entryData : entryData,
			filters   : filters
		};
	},
	provide() {
		return {
			filters : this.filters
		}
	},
	mounted() {
		const backToTop = document.getElementById("back-to-top");
		window.addEventListener("scroll", () => {
			if (window.scrollY > 1200) {
				backToTop.style.visibility = "visible";
				backToTop.style.opacity = 1;
			} else {
				backToTop.style.opacity = 0;
				setTimeout(() => {
					if (backToTop.style.opacity === 0) {
						backToTop.style.visibility = "hidden";
					}
				}, 200);
			}
		});

		// set each act in TOC to the same width
		let max = 0;
		this.$refs.act.forEach(act => {
			//act.clientWidth and act.offsetWidth are too small
			// window.getComputedStyle(act).width is too big
			// act.getBoundingClientRect().width is best, but it is a float
			const width = act.offsetWidth + 1; // add 1 to "round up"
			if (width > max) {
				max = width;
			}
		});
		this.$refs.act.forEach(act => {
			act.style.width = max+"px";
		});

		// calculate buy prices from entry value
		document.querySelectorAll(".value").forEach(value => {
			value.innerText = this.get_final_price(value.innerText);
		});

		loadSprites();
	},
	methods: {
		scrollToTop() {
			window.scrollTo({top: 0, behavior: "smooth"});
		},
		clearSearchHandler() {
			this.$refs.searchBar.value="";
			this.$store.commit("updateSearchString", "");
		},
		keyupHandler(event) {
			if (event.key == "Escape") {
				this.clearSearchHandler();
			} else {
				this.$store.commit("updateSearchString", event.target.value.toLowerCase());
			}
		},
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