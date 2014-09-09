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
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
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
}])
// need to include RemoteStorage as a dependency, otherwise it won't get instantiated (not called directly except as event listener)
.run(['$window', '$rootScope', 'RemoteStorage', function($window, $rootScope, RemoteStorage) {
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
}])
;
