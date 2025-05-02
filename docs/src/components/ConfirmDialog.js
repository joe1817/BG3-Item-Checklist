const ConfirmDialog = {
	template: `
<div ref="confirmModal" class="modal" style="display: none;">
	<div class="modal-content">
		<p ref="confirmMessage" id="confirmMessage">Are you sure?</p>
		<div class="confirm-buttons-wrapper">
			<div class="confirm-buttons">
				<button ref="confirmOk" id="confirmOk">OK</button>
				<button ref="confirmCancel" id="confirmCancel">Cancel</button>
			</div>
		</div>
	</div>
</div>
	`,
	methods: {
		confirm(opts, elementToBlur = document.body) {
			const modal = this.$refs.confirmModal;
			const confirmMessage = this.$refs.confirmMessage;
			const confirmOk = this.$refs.confirmOk;
			const confirmCancel = this.$refs.confirmCancel;

			confirmMessage.textContent = opts.message;
			modal.style.display = "flex";

			confirmOk.onclick = () => {
				modal.style.display = "none";
				opts.callback();
			};

			confirmCancel.onclick = () => {
				modal.style.display = "none";
			};
		}
	}
}