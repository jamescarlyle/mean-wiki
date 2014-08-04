var WikiModule = angular.module('WikiModule', ['ngSanitize'])
.filter('wikify', function() {
	return function(input) {
		// parse for captures - was /([A-Z][a-z]+){2,}/g
		var output = (input || '').replace(/#(\w+)/g, function(match, capture) {
			// add an icon for new items
			return (!localStorage['wiki_' + capture] ? '<span class="glyphicon glyphicon-flag"></span> ' : '') 
				+ '<a ' + 'href="#' + capture + '">#' + capture + '</a>';
				// + '<a ' + 'href="#' + capture + '">' + capture + '</a>';
		});
		// parse for paragraphs, and return
		return '<p>' + output.replace(/\n/g, '</p><p>') + '</p>';
	};
})
.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
})
.controller('WikiCtlr', function ($scope, $location) {
	$scope.savePage = function () {
		// save the edited wiki content into the array of pages
		localStorage['wiki_' + $scope.pageName] = $scope.wikiText;
	};
	$scope.$on('$locationChangeSuccess', function(event){
		// set the page name from the URL fragment
		$scope.pageName = $location.hash();
		// fetch the page 
		$scope.wikiText = localStorage['wiki_' + $scope.pageName] || '';
		$scope.editing = !$scope.wikiText;
	})
})
;