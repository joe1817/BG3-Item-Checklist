const InputDialogPlugin = {
	install: (app, options) => {
		const mountPoint = document.createElement("div");
		mountPoint.setAttribute("id", "app-input-dialog");
		const dialog = Vue.createApp(InputDialog).mount(mountPoint);
		app.config.globalProperties.$input = (prompt, successCallback) => {
			dialog.input(prompt, successCallback);
		}
		document.addEventListener("DOMContentLoaded", () => {
			document.body.appendChild(mountPoint);
		});
	}
};

const InputDialog = {
	template: `
<div ref="inputDialog" v-show="show" id="input-dialog">
	<div class="window">
		<div class="header">
			<div class="title-wrapper">
				<span class="icon">✏</span>
				<span class="title">{{ title }}</span>
			</div>
			<button ref="xButton" class="close-button">&times;</button>
		</div>
		<div class="body">
			<p ref="prompt" class="prompt">{{ prompt }}</p>
			<p>
				<input
					type="text"
					class="text-input"
					maxlength="50"
					v-model="value"
					:placeholder="placeholder"
					@keydown.enter="submitForm"
					@input="errorMessage=''"
				>
			</p>
			<p ref="errorMessage" v-show="errorMessage" class="error-message">{{ errorMessage }}</p>
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
			show         : false,
			value        : "",
			errorMessage : "",
			title        : "",
			prompt       : "",
			placeholder  : "",
			okText       : "",
		}
	},

	methods: {
		submitForm() {
			this.$refs.okButton.click();
		},

		input({title = "Input", prompt = "Awaiting input...", placeholder = "(„• ֊ •„)", okText = "OK", validate = null, onOK = null} = {}) {
			if (this.show)
				return;

			this.value = "";
			this.errorMessage = "";

			this.title = title;
			this.prompt = prompt;
			this.placeholder = placeholder;
			this.okText = okText;

			const xButton = this.$refs.xButton;
			const okButton = this.$refs.okButton;
			const cancelButton = this.$refs.cancelButton;

			xButton.onclick = () => {
				this.show = false;
			};

			okButton.onclick = () => {
				error = validate ? validate(this.value) : "";
				if (error) {
					this.errorMessage = error;
				}
				else {
					this.show = false;
					if (onOK)
						onOK(this.value);
				}
			};

			cancelButton.onclick = () => {
				this.show = false;
			};

			this.show = true;
		}
	}
}
