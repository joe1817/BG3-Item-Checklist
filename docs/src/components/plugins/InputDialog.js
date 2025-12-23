const InputDialogPlugin = {
	install: (app, options) => {
		const mountPoint = document.createElement("div");
		mountPoint.setAttribute("id", "app-input-dialog");
		const dialog = Vue.createApp(InputDialog).mount(mountPoint);
		app.config.globalProperties.$input = (message, successCallback) => {
			dialog.input(message, successCallback);
		}
		document.addEventListener("DOMContentLoaded", () => {
			document.body.appendChild(mountPoint);
		});
	}
};

const InputDialog = {
	template: `
<div v-show="show" ref="inputDialog" id="input-dialog">
	<div class="window">
		<div class="header">
			<div class="title-wrapper">
				<span class="icon">✏</span>
				<span class="title">{{ title }}</span>
			</div>
			<button ref="xButton" class="close-button">&times;</button>
		</div>
		<div class="body">
			<p ref="message" class="message">{{ message }}</p>
			<p>
				<input
					type="text"
					class="text-input"
					maxlength="50"
					v-model="value"
					:placeholder="placeholder"
					@keydown.enter="submitForm"
				>
			</p>
		</div>
		<div class="footer">
			<div class="buttons">
				<button ref="cancelButton" class="cancel-button">Cancel</button>
				<button ref="okButton" class="ok-button">{{ okText }}</button>
			</div>
		</div>
	</div>
</div>
	`,

	data() {
		return {
			show        : false,
			value       : "",
			title       : "",
			message     : "",
			placeholder : "",
			okText      : "",
		}
	},

	methods: {
		submitForm() {
			this.$refs.okButton.click();
		},

		input({title = "Input", message = "Awaiting input...", placeholder = "(„• ֊ •„)", okText = "OK", onOK = null} = {}) {
			if (this.show)
				return;

			this.value = "";

			this.title = title;
			this.message = message;
			this.placeholder = placeholder;
			this.okText = okText;

			const xButton = this.$refs.xButton;
			const okButton = this.$refs.okButton;
			const cancelButton = this.$refs.cancelButton;

			xButton.onclick = () => {
				this.show = false;
			};

			okButton.onclick = () => {
				this.show = false;
				if (onOK)
					onOK(this.value);
			};

			cancelButton.onclick = () => {
				this.show = false;
			};

			this.show = true;
		}
	}
}
