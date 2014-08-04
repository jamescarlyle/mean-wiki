angular.module('wikiFilters', ['ngSanitize'])
// filter to convert names to links
.filter('wikify', function() {
	return function(input) {
		// parse for names - was /([A-Z][a-z]+){2,}/g
		var output = (input || '').replace(/#(\w+)/g, function(match, capture) {
			// add an icon for new items
			return (!localStorage[capture] ? '<span class="glyphicon glyphicon-flag"></span> ' : '') 
				+ '<a ' + 'href="#/items/' + capture + '">' + capture + '</a>';
		});
		// parse for paragraphs, and return - was /\n{2}/g
		return '<p>' + output.replace(/\n/g, '</p><p>') + '</p>';
	};
})
;