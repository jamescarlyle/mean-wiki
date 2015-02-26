var app = angular.module('app', [
	'ngRoute',
	'static',
	'config',
	'userMessage',
	'filters',
	'resources',
	'remoteStorage',
	'localStorage',
	'comparison',
	'controllers',
	'userStorage',
])
// configure routes
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
	when('/users/:emailAddress', {
		templateUrl: 'views/user.html',
		controller: 'UserCtrl'
	}).
	when('/authenticate/header', {
		templateUrl: 'views/auth-result.html',
		controller: 'AuthTokenCtrl'
	}).
	when('/:schema/:name', {
		templateUrl: function(params) { return 'views/' + params.schema + '-detail.html' },
		controller: 'ItemDetailCtrl'
	}).
	when('/authenticate', {
		templateUrl: 'views/authenticate.html',
		controller: 'AuthenticateCtrl'
	}).
	when('/account', {
		templateUrl: 'views/user.html',
		controller: 'UserCtrl'
	}).
	when('/:schema', {
		templateUrl: function(params) { return 'views/' + params.schema + '-list.html' },
		controller: 'ItemListCtrl'
	}).
	when('/', {
		templateUrl: 'views/getting-started.html'
	}).
	otherwise({
		redirectTo: '/'
	});
}])
.controller('ApplicationCtrl', function($scope) {
	$scope.setCurrentUser = function (user) {
		$scope.currentUser = user;
	};
})
.run(['$window', '$rootScope', function($window, $rootScope) {
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
	$rootScope.$on('$locationChangeStart', function (event, next, current) {
		// TODO this can't be controlled by locationChangeStart, as sometimes the message is displayed on a page where the location is not changing
		if ($rootScope.justSet) {
			$rootScope.justSet = false;
		} else {
			// clear message
			$rootScope.opStatus = '';
		}
	});
}])
;
	// when('/authenticate/header', {
	// 	resolve: {
	// 		auth: function(authService, $routeParams, $route) { 
	// 			alert( authService.authenticateHeader($route.current.params) );
	// 		}
	// 	},
	// 	redirectTo: function (routeParams, path, search) {
	// 		return "/items";
	// 	}
	// }).
// .factory('authService', function($http, $location, Authenticate) {
//     return {
//         authenticateHeader: function(params) {
// 			$http.defaults.headers.common['Authorization'] = 'Bearer ' + params.sub;
// 			Authenticate.login({emailAddress: params.email}).$promise.then(function (user) {
// 				// this scope method is on the parent  ApplicationCtrl
// 				// $scope.setCurrentUser(user);
// 				console.log(user);
// 			});
//            return "Hello World!";
//         }
//     };
// })
// set up event listeners
