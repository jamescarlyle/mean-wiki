var wikiModule = angular.module('wikiModule', [
	'ngRoute',
	'wikiControllers',
	'wikiFilters',
	'wikiResources',
	'wikiServices',
	'comparison',
	'config'
])
// configure routes
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/items/:name', {
		templateUrl: 'views/item-detail.html',
		controller: 'ItemDetailCtrl'
	}).
	when('/items', {
		templateUrl: 'views/item-list.html',
		controller: 'ItemListCtrl'
	}).
	when('/', {
		templateUrl: 'views/getting-started.html'
	}).
	otherwise({
		redirectTo: '/items'
	});
}])
// set up a generic error handler
.factory("Message", function($rootScope){
	return {
		success: function(caughtMessage) {
			$rootScope.opMessage = caughtMessage;
			$rootScope.opStatus = 'success';
		},
		failure: function(caughtMessage) {
			$rootScope.opMessage = caughtMessage;
			$rootScope.opStatus = 'warning';
		}
	};
})
.run(function($window, $rootScope) {
	$rootScope.online = navigator.onLine;
	$window.addEventListener('offline', function () {
		$rootScope.$apply(function() {
			$rootScope.online = false;
		});
	});
	$window.addEventListener('online', function () {
		$rootScope.$apply(function() {
			$rootScope.online = true;
		});
	});
})
;