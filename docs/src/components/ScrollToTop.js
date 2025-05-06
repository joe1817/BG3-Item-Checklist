const ScrollToTop = {
	template: `
<div
	id="back-to-top"
	ref="back-to-top"
	@click="scrollToTop"
>Back to Top</div>
`,
	mounted() {
		// toggle visibility based on scroll position
		const backToTop = this.$refs["back-to-top"];
		window.addEventListener("scroll", () => {
			if (window.scrollY > 1200) {
				backToTop.style.visibility = "visible";
				backToTop.style.opacity = 1;
			} else {
				backToTop.style.opacity = 0;
				setTimeout(() => {
					if (backToTop.style.opacity === "0") {
						backToTop.style.visibility = "hidden";
					}
				}, 200);
			}
		});
	},
	methods: {
		scrollToTop() {
			window.scrollTo({top: 0, behavior: "smooth"});
		},
	},
}