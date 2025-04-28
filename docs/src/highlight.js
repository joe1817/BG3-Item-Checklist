function highlightSubstring(htmlString, searchString) {
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = htmlString;

	function recursivelyHighlight(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent;
			const regex = new RegExp(escapeRegExp(searchString), 'gi');
			let match;
			let newNodes = [];
			let lastIndex = 0;

			while ((match = regex.exec(text)) !== null) {
				const before = text.substring(lastIndex, match.index);
				const highlighted = text.substring(match.index, regex.lastIndex);

				if (before) {
					newNodes.push(document.createTextNode(before));
				}

				const span = document.createElement('span');
				span.classList.add('highlighted');
				span.textContent = highlighted;
				newNodes.push(span);

				lastIndex = regex.lastIndex;
			}

			if (lastIndex < text.length) {
				newNodes.push(document.createTextNode(text.substring(lastIndex)));
			}

			if (newNodes.length > 1 || (newNodes.length === 1 && newNodes[0] !== node)) {
				newNodes.forEach(newNode => node.parentNode.insertBefore(newNode, node));
				node.parentNode.removeChild(node);
			}
			return newNodes.length;

		} else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
			for (let i = 0; i < node.childNodes.length; ) {
				i += recursivelyHighlight(node.childNodes[i]);
			}
			return 1;
		}
	}

	recursivelyHighlight(tempDiv);
	return tempDiv.innerHTML;
}

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/*
// Example usage:
const htmlContent = `
	<div>
		<p>This paragraph contains the word search multiple times: search, SEARCH, and seArCh.</p>
		<span>Another span with the term search here.</span>
		<ul>
			<li>Item with a search inside.</li>
		</ul>
		<script>const searchText = "search";</script>
		<style>.highlighted { background-color: yellow; }</style>
	</div>
`;
const searchTerm = "search";
const highlightedHTML = highlightSubstring(htmlContent, searchTerm);
console.log(highlightedHTML);

// To apply this to an element in your actual DOM:
// document.getElementById('yourElement').innerHTML = highlightedHTML;
*/