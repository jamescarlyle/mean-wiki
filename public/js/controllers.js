var controllers = angular.module('controllers', ['localStorage', 'remoteStorage', 'userMessage', 'comparison', 'authenticate'])
.controller('ItemListCtrl', function ($scope, $rootScope, Configuration, RemoteStorage, LocalStorage) {
	// freshen local storage from server - will not overwrite items that have not yet been stored, i.e. additive only
	$scope.refreshItems = function() {
		var lastCheck = Configuration.getModifiedSince();
		// this is set before the fetch, because otherwise there is a small gap between the fetch and now that will not be picked up next time
		Configuration.setModifiedSince(Date.now());
		// get the list of items and people from the server
		['items','people'].forEach(function(schema) {
			RemoteStorage.retrieveModifiedSince($scope.currentUser.id, schema, lastCheck).$promise.then(function(serverItems) {
				for (i = 0; i < serverItems.length; i++) {
					// arange items for comparison
					var remoteItem = serverItems[i];
					var localItem = LocalStorage.retrieveByName(remoteItem.name);
					// retrieveByName returns an empty object if not found, so check for clientUpdate
					if (!localItem.clientUpdate) {
						// store remote item
						LocalStorage.store(remoteItem, false);
						// now add the item to the scope items list
						$scope.items[remoteItem.name] = remoteItem.summary;
					// if local remote is same as remote, and local is ahead of remote, we have a local update not persisted
					} else if (localItem.serverUpdate == remoteItem.serverUpdate && localItem.clientUpdate > localItem.serverUpdate) {
						// if online and logged in, save
						RemoteStorage.store(localItem);
					} else if (localItem.serverUpdate != remoteItem.serverUpdate) {
						// TODO for the time being, simply update the remote update time on the local instance
						localItem.serverUpdate = remoteItem.serverUpdate;
						// and store locally
						LocalStorage.store(localItem, false);
						// now update item to the scope items list
						$scope.items[localItem.name] = localItem.summary;
					};
				}
			});
		});
	};
	$scope.items = LocalStorage.retrieveAll();
})
.controller('ItemDetailCtrl', function ($scope, $rootScope, $routeParams, $location, LocalStorage, RemoteStorage, Comparison) {
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
		// save the edited wiki content to the local storage, and apply remotely
		LocalStorage.store($scope.item, true);
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
.controller('AuthenticateCtrl', function($scope, $location, Authenticate) {
	$scope.user = {};
	$scope.login = function(user) {
		Authenticate.login(user).$promise
		.then(function (user) {
			// this scope method is on the parent controller ApplicationCtrl
			$scope.setCurrentUser(user);
			$location.path('/items/');
		})
		// .catch() //
		; //
	};
	$scope.logout = function() {
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
		//  TODO $scope.user = $routeParams.emailAddress ? UserStorage.retrieveByEmailAddress($routeParams.emailAddress) : new User();
		// TODO - previous user remained on form after logout
		$scope.user = $scope.currentUser ? UserStorage.retrieve($scope.currentUser.id) : new User();
	}
	$scope.loadUser();
});