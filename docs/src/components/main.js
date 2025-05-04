const app = Vue.createApp(App);

app.component("Filter", Filter);
app.component("Entry", Entry);
app.component("Container", Container);
app.component("EntryContainer", EntryContainer);

const { createStore } = Vuex;
const store = createStore(State);

app.use(store);
app.use(highlightPlugin, {state: store.state});
app.use(ConfirmDialogPlugin);

document.addEventListener("DOMContentLoaded", () => {
	app.mount("#app");
});