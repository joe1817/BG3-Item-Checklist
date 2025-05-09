const DefaultContainer = {
	template: `
<Container
	:data="data"
>

	<template #nestedContainer="props">
		<DefaultContainer
			:data="props.data"
		>
		</DefaultContainer>
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