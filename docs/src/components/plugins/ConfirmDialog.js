const ConfirmDialogPlugin = {
	install: (app, options) => {
		const mountPoint = document.createElement("div");
		mountPoint.setAttribute("id", "app-confirm-dialog");
		const dialog = Vue.createApp(ConfirmDialog).mount(mountPoint);
		app.config.globalProperties.$confirm = (message, successCallback) => {
			dialog.confirm(message, successCallback);
		}
		document.addEventListener("DOMContentLoaded", () => {
			document.body.appendChild(mountPoint);
		});
	}
};

const ConfirmDialog = {
	template: `
<div ref="confirmDialog" id="confirm-dialog" style="display: none;">
	<div class="content">
		<p ref="message" class="message">Are you sure?</p>
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
		confirm(msg, successCallback) {
			const modal = this.$refs.confirmDialog;
			const message = this.$refs.message;
			const okButton = this.$refs.okButton;
			const cancelButton = this.$refs.cancelButton;

			message.textContent = msg;
			modal.style.display = "flex";

			okButton.onclick = () => {
				modal.style.display = "none";
				successCallback();
			};

			cancelButton.onclick = () => {
				modal.style.display = "none";
			};
		}
	}
}
