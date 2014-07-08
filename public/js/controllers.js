var WikiModule = angular.module('WikiModule', ['ngSanitize'])
.filter('wikify', function() {
	return function(input) {
		// parse for WikiWords
		var output = (input || '').replace(/([A-Z][a-z]+){2,}/g, function(wikiWord) {
			// add an icon for new items
			return (!localStorage['wiki_' + wikiWord] ? '<span class="glyphicon glyphicon-flag"></span> ' : '') 
				+ '<a ' + 'href="#' + wikiWord + '">' + wikiWord + '</a>';
		});
		// parse for paragraphs, and return
		return '<p>' + output.replace(/\n{2}/g, '</p><p>') + '</p>';
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