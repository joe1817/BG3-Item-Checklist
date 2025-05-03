const EntryContainer = {
	template: `
<Container
	:entry="entry"
	:parentMatchesSearch="parentMatchesSearch"
>

	<template #nestedContainer="props">
		<EntryContainer
			:entry="props.entry"
			:parentMatchesSearch="props.parentMatchesSearch"
		>
		</EntryContainer>
	</template>

	<template #leaf="props">
		<Entry
			:entry="props.entry"
			:parentMatchesSearch="props.parentMatchesSearch"
		>
		</Entry>
	</template>

</Container>
`,
	props: {
		entry: {},
		parentMatchesSearch: {
			type: Boolean,
			default: false
		}
	}
}