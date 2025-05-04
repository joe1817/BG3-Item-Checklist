const EntryContainer = {
	template: `
<Container
	:data="data"
>

	<template #nestedContainer="props">
		<EntryContainer
			:data="props.data"
		>
		</EntryContainer>
	</template>

	<template #leaf="props">
		<Entry
			:data="props.data"
		>
		</Entry>
	</template>

</Container>
`,
	props: {
		data: {}
	}
}