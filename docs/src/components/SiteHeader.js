const SiteHeader = {
	template: `
<div id="site-header" class="header" ref="top-menu">
	<div id="link-section" class="header-component">
		<a href="https://github.com/joe1817/BG3-Item-Checklist">
			<button>
				<img src="github-mark-white.png" height="30px">
			</button>
		</a>
	</div>
	<div id="profile-section" class="header-component">
		<div id="profiles" class="custom-select">
			<label for="profile-choice">Profile: </label>
			<select
				id="profile-choice"
				name="profile"
				:value="$store.state.activeProfile"
				@change="setProfile"
			>
				<option
					v-for="profile in $store.state.allProfiles"
					:value="profile"
				>
					{{ profile }}
				</option>
			</select>
		</div>
		<button
			class="noselect"
			@click="createProfile"
			style="padding-bottom: 2px;"
		>
			+
		</button>
		<button
			class="noselect"
			@click="deleteProfile"
		>
			🗑
		</button>
	</div>
</div>
`,
	methods: {
		setProfile(event) {
			const profile = event.target.value;
			this.$store.dispatch("saveProfile", profile);
		},
		createProfile() {
			const placeholders = [
				"(∩｀-´)⊃━☆ﾟ.*･｡ﾟ",
				"(„• ֊ •„)",
			];
			this.$input({
				title       : "Create Profile",
				prompt      : "Profile Name:",
				placeholder : placeholders[Math.floor(Math.random() * placeholders.length)],
				validate    : (text) => {
					text = text.trim();
					if (text.length === 0) {
						return "This profile name is invalid.";
					}
					if (this.$store.state.allProfiles.includes(text)) {
						return "This profile already exists.";
					}
					return "";
				},
				onOK        : (profile) => this.$store.dispatch("createProfile", profile)
			});
		},
		deleteProfile() {
			const profile = this.$store.state.activeProfile;
			this.$confirm({
				danger    : true,
				title     : "Confirm Delete",
				prompt    : "Delete this profile?",
				selection : profile,
				okText    : "Delete",
				onOK      : () => {
					if (profile == "(Default)") {
						this.$store.dispatch("createProfile", profile);
					} else {
						this.$store.dispatch("deleteProfile", profile);
					}
				}
			});
		},
	}
}
