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
<div ref="inputDialog" id="input-dialog" style="display: none;">
	<div class="content">
		<p ref="message" class="message">Awaiting input...</p>
		<p>
			<input
				type="text"
				ref="inputBar"
				class="text-input"
				maxlength="50"
			>
		</p>
		<div class="buttons-wrapper">
			<div class="buttons">
				<button ref="okButton" class="ok-button">OK</button>
				<button ref="cancelButton" class="cancel-button">Cancel</button>
			</div>
		</div>
	</div>
</div>
	`,
	methods: {
		input(msg, successCallback) {
			const modal = this.$refs.inputDialog;
			const message = this.$refs.message;
			const inputBar = this.$refs.inputBar;
			const okButton = this.$refs.okButton;
			const cancelButton = this.$refs.cancelButton;

			message.textContent = msg;
			inputBar.value = "";

			modal.style.display = "flex";

			okButton.onclick = () => {
				modal.style.display = "none";
				successCallback(inputBar.value);
			};

			cancelButton.onclick = () => {
				modal.style.display = "none";
			};
		}
	}
}
