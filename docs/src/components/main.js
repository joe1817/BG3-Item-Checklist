const app = Vue.createApp(App);

app.component("TopMenu", TopMenu);
app.component("ScrollToTop", ScrollToTop);
app.component("TableOfContents", TableOfContents);
app.component("Filter", Filter);
app.component("Options", Options);
app.component("Entry", Entry);
app.component("ProgressHeader", ProgressHeader);
app.component("Container", Container);
app.component("DefaultContainer", DefaultContainer);

const { createStore } = Vuex;
const store = createStore(State);

app.use(store);
app.use(highlightPlugin, {state: store.state});
app.use(ConfirmDialogPlugin);
app.use(InputDialogPlugin);

document.addEventListener("DOMContentLoaded", () => {
	app.mount("#app-main");
});