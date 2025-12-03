const TopMenu = {
	template: `
<div id="top-menu" ref="top-menu">
	<div id="link-section">
		<a class="top-link" href="https://github.com/joe1817/BG3-Item-Checklist">
			<img src="github-mark-white.png" height="30px">
		</a>
	</div>
	<div id="profile-section">
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
		<div class="text-button noselect"
			@click="createProfile"
		>
			+
		</div>
		<div class="text-button noselect"
			:class="{enabled: $store.state.activeProfile != '(Default)'}"
			@click="deleteProfile"
		>
			🗑
		</div>
	</div>
</div>
`,
	methods: {
		setProfile(event) {
			const profile = event.target.value;
			this.$store.dispatch("setProfileAndSave", profile);
		},
		createProfile() {
			this.$input(
				"Please input the name of the new profile.",
				(profile) => this.$store.dispatch("createProfileAndSave", profile)
			);
		},
		deleteProfile() {
			const profile = this.$store.state.activeProfile;
			this.$confirm(
				"Delete profile \"" + profile + "\"?",
				() => {
					if (profile === "(Default)") {
						this.$store.dispatch("createProfileAndSave", profile);
					} else {
						this.$store.dispatch("deleteProfileAndSave", profile);
					}
				}
			);
		},
	}
}
