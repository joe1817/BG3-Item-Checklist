const ProgressHeader = {
	template: `
<span
	:class="{
		'progress-header': true,
		active: $store.state.countTotal[id] || !trackable,
	}"
>
	<template v-if="$attrs.onClick">
		<a v-if="searchable" class="title" v-bind="$attrs" v-html="$highlight(title)"></a>
		<a v-else class="title" v-bind="$attrs">{{ title }}</a>
	</template>

	<template v-else>
		<span v-if="searchable" class="title" v-bind="$attrs" v-html="$highlight(title)"></span>
		<span v-else class="title" v-bind="$attrs">{{ title }}</span>
	</template>

	<span v-if="trackable"
		:class="{
			progress: true,
			started: $store.state.countProgress[id],
			completed: $store.state.countProgress[id] == $store.state.countTotal[id],
		}"
	>{{ $store.state.countProgress[id] || 0 }}/{{ $store.state.countTotal[id] || 0 }}
	</span>
</span>
`,
	inheritAttrs: false,
	props: {
		id: {
			type: String,
		},
		title: {
			type: String,
		},
		searchable: {
			type: Boolean,
			default: true,
		},
		trackable: {
			type: Boolean,
			default: true,
		},
	},
}