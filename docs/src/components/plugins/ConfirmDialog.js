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
<div v-show="show" ref="confirmDialog" id="confirm-dialog" :class="{danger: danger}">
	<div class="window">
		<div class="header">
			<div class="title-wrapper">
				<span class="icon">⚠️</span>
				<span class="title">{{ title }}</span>
			</div>
			<button ref="xButton" class="close-button">&times;</button>
		</div>
		<div class="body">
			<p ref="message" class="message">{{ message }}</p>
			<p ref="selection" class="selection">{{ selection }}</p>
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
			show      : false,
			danger    : false,
			title     : "",
			message   : "",
			selection : "",
			okText    : "",
		}
	},

	methods: {
		confirm({danger = false, title = "Confirm", message = "Are you sure?", selection = "", okText = "OK", onOK = null} = {}) {
			if (this.show)
				return;

			this.danger = danger;
			this.title = title;
			this.message = message;
			this.selection = selection;
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
					onOK();
			};

			cancelButton.onclick = () => {
				this.show = false;
			};

			this.show = true;
		}
	}
}
