angular.module('wikiFilters', ['ngSanitize'])
// filter to convert names to links
.filter('wikify', function() {
	return function(input) {
		// parse for names
		var output = (input || '').replace(/([A-Z][a-z]+){2,}/g, function(name) {
			// add an icon for new items
			return (!localStorage[name] ? '<span class="glyphicon glyphicon-flag"></span> ' : '') 
				+ '<a ' + 'href="#/items/' + name + '">' + name + '</a>';
		});
		// parse for paragraphs, and return
		return '<p>' + output.replace(/\n{2}/g, '</p><p>') + '</p>';
	};
})
;