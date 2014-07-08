var wikiModule = angular.module('wikiModule', [
	'ngRoute',
	'wikiControllers'
])
// configure routes
.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/items', {
			templateUrl: 'item-list.html',
			controller: 'ItemListCtrl'
		}).
		when('/items/:_id', {
			templateUrl: 'item-detail.html',
			controller: 'ItemDetailCtrl'
		}).
		otherwise({
			redirectTo: '/items'
		});
 	}
 ]);