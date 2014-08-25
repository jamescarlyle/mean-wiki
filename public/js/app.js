var app = angular.module('app', [
	'ngRoute',
	'config',
	'userMessage',
	'filters',
	'resources',
	'remoteStorage',
	'localStorage',
	'comparison',
	'controllers'
])
// configure routes
.config(function($routeProvider, $locationProvider) {
	$routeProvider.
	when('/:schema/:name', {
		templateUrl: function(params) { return '/views/' + params.schema + '-detail.html' },
		controller: 'ItemDetailCtrl'
	}).
	when('/:schema/', {
		templateUrl: function(params) { return '/views/' + params.schema + '-list.html' },
		controller: 'ItemListCtrl'
	}).
	when('/', {
		templateUrl: '/views/getting-started.html'
	}).
	otherwise({
		redirectTo: '/'
	});
	// use the HTML5 History API
	// $locationProvider.html5Mode(true);
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
