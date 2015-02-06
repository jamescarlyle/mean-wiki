var controllers = angular.module('controllers', ['localStorage', 'remoteStorage', 'userMessage', 'comparison', 'authenticate', 'syncLocalRemote'])
.controller('ItemListCtrl', function ($scope, $rootScope, Configuration, RemoteStorage, LocalStorage, SyncLocalRemote) {
	// freshen local storage from server - will not overwrite items that have not yet been stored, i.e. additive only
	var loadItems = function() {
		$scope.items = LocalStorage.retrieveAll();
	};
	$scope.refreshItems = function() {
		SyncLocalRemote.refreshItems($scope.currentUser, loadItems);
	};
	loadItems();
})
.controller('ItemDetailCtrl', function ($scope, $rootScope, $routeParams, $location, $http, LocalStorage, RemoteStorage, Comparison) {
	$scope.loadItem = function() {
		// fetch the item content using the name from the URL fragment
		$scope.item = LocalStorage.retrieveBySchema($routeParams.schema, $routeParams.name);
		// determine whether we should immediately go into edit mode, if the page does not exist
		$scope.editing = !$scope.item.content && !$scope.item.notes;
	};
	$scope.saveItem = function() {
		// if logged in, set the item's user id to be that of the logged in user
		if ($scope.currentUser) {
			$scope.item.user_id = $scope.currentUser.id;
		}
		// set the client update to now
		$scope.item.clientUpdate = Date.now();
		// save the edited wiki content to the local storage, and if online and logged in, apply remotely
		LocalStorage.store($scope.item, $rootScope.online && $scope.item.user_id != null);
	};
	$scope.removeItem = function() {
       if (confirm('do you want to delete this item?') == true) {
        	// send a delete to the remote store, and apply remotely
			LocalStorage.remove($scope.item, true);
			// redirect to the list page
			$location.path('/items');
		}
	};
	$scope.compareItem = function() {
		// for the Refresh button - fetch the item content using the name from the URL fragment
		$scope.item = LocalStorage.retrieveBySchema($routeParams.schema, $routeParams.name);
		// fetch remote item
		RemoteStorage.retrieveOne($scope.currentUser.id, $scope.item.schema, $scope.item.id).$promise.then(function(item) {
			$scope.remoteItem = item;
			$scope.comparison = Comparison.compare($scope.item, $scope.remoteItem);
		});
		$scope.editing = true;
	}
	// retain this structure (separately defined and called method) as easier to test
	$scope.loadItem();
})
.controller('AuthenticateCtrl', function($scope, $location, $http, Authenticate) {
	$scope.user = {};
	$scope.login = function(user) {
		$http.defaults.headers.common['Authorization'] = 'Basic ' + Authenticate.encode(user.emailAddress + ':' + user.password);
		Authenticate.login(user).$promise
		.then(function (user) {
			// this scope method is on the parent controller ApplicationCtrl
			$scope.setCurrentUser(user);
			$location.path('/items/');
		});
	};
	$scope.logout = function() {
		delete $http.defaults.headers.common['Authorization'];
		Authenticate.logout();
		$scope.setCurrentUser(null);
		$location.path('/items/');
	}
})
.controller('UserCtrl', function($scope, $routeParams, $location, UserStorage, User) {
	$scope.saveUser = function() {
		UserStorage.store($scope.user);
		$location.path($scope.currentUser ? '/items/' : '/authenticate/');
	};
	$scope.loadUser = function() {
		// TODO - previous user remained on form after logout
		$scope.user = $scope.currentUser ? UserStorage.retrieve($scope.currentUser.id) : new User();
	}
	$scope.loadUser();
});