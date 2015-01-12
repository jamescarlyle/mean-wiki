angular.module('filters', ['ngSanitize'])
// filter to convert names to links
.filter('wikify', function() {
	return function(input) {
		// parse for names - was /([A-Z][a-z]+){2,}/g
		var output = (input || '').replace(/([#\@])(\w+)/g, function(match, captureScheme, captureName) {
			// add an icon for new items
			return (!localStorage[match] ? '<span class="glyphicon glyphicon-flag"></span> ' : '') 
				+ '<a href="#/' + (captureScheme == '#' ? 'items/' : 'people/') + captureName + '">' + match + '</a>';
		});
		// parse for paragraphs, and return
		return '<p>' + output.replace(/\n/g, '</p><p>') + '</p>';
	};
})
;