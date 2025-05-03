const EntryContainer = {
	template: `
<Container
	:entry="entry"
>

	<template #nestedContainer="props">
		<EntryContainer
			:entry="props.entry"
		>
		</EntryContainer>
	</template>

	<template #leaf="props">
		<Entry
			:entry="props.entry"
		>
		</Entry>
	</template>

</Container>
`,
	props: {
		entry: {}
	}
}