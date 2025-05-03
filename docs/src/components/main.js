const app = Vue.createApp(App);

app.component("Filter", Filter);
app.component("Entry", Entry);
app.component("Container", Container);
app.component("EntryContainer", EntryContainer);
app.component("ConfirmDialog", ConfirmDialog);

const { createStore } = Vuex;
const store = createStore(State);

app.use(store)

document.addEventListener("DOMContentLoaded", () => {
	app.mount("#app");
});