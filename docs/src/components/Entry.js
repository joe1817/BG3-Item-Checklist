const Entry = {
	template: `
<div
	ref="content"
	:id="data.id"
	:class="[
		'entry',
		data.categories,
		data.rarity,
		{
			'top-tier': data.suggested,
			completed: $store.getters.checkboxState[data.id],
			'indented': data.indented
		}
	]"
	v-show="$store.state.visible[data.id]"
	@click="handleClick($event)"
>
	<span v-if="checkbox" class="checkbox"><input type="checkbox" :checked="$store.getters.checkboxState[data.id]"></span>
	<template v-if="data.spriteCoords">
		<div class="image">
			<div class="sprite-background">
				<div
					class="entry-img sprite"
					:style="spriteStyle"
				></div>
			</div>
		</div>
	</template>
	<template v-else>
		<img class="entry-img" :src="data.img" width=50 height=50>
	</template>


	<template v-if="data.title">
		<template v-if="data.link">
			<span v-if="searchable" class="title"><a :href="data.link" v-html="$highlight(data.id, data.title)"></a></span>
			<span v-else class="title"><a :href="data.link" v-html="data.title"></a></span>
		</template>

		<template v-else>
			<span v-if="searchable" class="title" v-html="$highlight(data.id, data.title)"></span>
			<span v-else class="title" v-html="data.title"></span>
		</template>
	</template>

	<template v-if="data.desc">
		<span v-if="searchable" class="desc" v-html="$highlight(data.id, data.desc)"></span>
		<span v-else class="desc" v-html="data.desc"></span>
	</template>
</div>
`,

	props: {
		data: {},
		checkbox: {
			type: Boolean,
			default: true
		},
		searchable: {
			type: Boolean,
			default: true
		}
	},

	methods: {
		handleClick(event) {
			if (this.checkbox && event.target.tagName !== "A") {
				this.$store.dispatch("toggleCheckbox", this.data.id)
			}
		}
	},

	computed: {
		spriteStyle() {
			const x = this.data.spriteCoords[0];
			const y = this.data.spriteCoords[1];

			return {
				width: `${SPRITE_SIZE}px`,
				height: `${SPRITE_SIZE}px`,
				backgroundImage: "url(sprites.png)",
				backgroundPosition: `-${x}px -${y}px`,
				backgroundRepeat: "no-repeat",
				flexShrink: 0
			};
		}
	}
}