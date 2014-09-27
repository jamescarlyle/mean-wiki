var controllers = angular.module('controllers', ['localStorage', 'remoteStorage', 'userMessage', 'comparison', 'authenticate'])
.controller('ItemListCtrl', function ($scope, $rootScope, Configuration, RemoteStorage, LocalStorage) {
	// freshen local storage from server - will not overwrite items that have not yet been stored, i.e. additive only
	$scope.refreshItems = function() {
		var lastCheck = Configuration.getModifiedSince();
		// this is set before the fetch, because otherwise there is a small gap between the fetch and now that will not be picked up next time
		Configuration.setModifiedSince(Date.now());
		// get the list of items and people from the server
		['items','people'].forEach(function(schema) {
			RemoteStorage.retrieveModifiedSince($scope.currentUser._id, schema, lastCheck).$promise.then(function(serverItems) {
				var localItem, remoteItem;
				for (i = 0; i < serverItems.length; i++) {
					// arange items for comparison
					remoteItem = serverItems[i];
					localItem = LocalStorage.retrieve(remoteItem.name);
					// if local remote is same as remote, and local is ahead of remote, we have a local update not persisted
					if (localItem.serverUpdate == remoteItem.serverUpdate && localItem.clientUpdate > localItem.serverUpdate) {
						// signal recent local save, will trigger remote save
						$rootScope.$emit('localStorageStored', localItem);
					} else if (localItem.serverUpdate != remoteItem.serverUpdate) {
						// for the time being, simply update the remote update time on the local instance
						localItem.serverUpdate = remoteItem.serverUpdate;
						// and store locally
						LocalStorage.store(localItem, false);
					}
				}
			});
		});
	};
	$scope.getItemByName = function (name) {
		return LocalStorage.retrieve(name);
	};
	// set up initial list of items
	$scope.items = LocalStorage.retrieveAll();
})
.controller('ItemDetailCtrl', function ($scope, $rootScope, $routeParams, $location, LocalStorage, RemoteStorage, Comparison) {
	$scope.loadItem = function() {
		// fetch the item content using the name from the URL fragment
		$scope.item = LocalStorage.retrieve($routeParams.schema, $routeParams.name);
		// determine whether we should immediately go into edit mode, if the page does not exist
		$scope.editing = !$scope.item.content && !$scope.item.notes;
		// TODO remove as being set in app module
		// // clear message
		// $rootScope.opStatus = '';
	};
	$scope.saveItem = function() {
		// set the client update to now
		$scope.item.clientUpdate = Date.now();
		// save the edited wiki content to the local storage, raise event for remote storage to listen to
		LocalStorage.store($scope.item, true);
	};
	$scope.removeItem = function() {
       if (confirm('do you want to delete this item?') == true) {
        	// send a delete to the remote store, raise event for remote storage to listen to
			LocalStorage.remove($scope.item, true);
			// redirect to the list page
			$location.path('/items');
		}
	};
	$scope.compareItem = function() {
		// fetch the item content using the name from the URL fragment
		$scope.item = LocalStorage.retrieve($routeParams.schema, $routeParams.name);
		// fetch remote item
		RemoteStorage.retrieveOne($scope.currentUser._id, $scope.item.schema, $scope.item._id).$promise.then(function(item) {
			$scope.remoteItem = item;
			$scope.comparison = Comparison.compare($scope.item, $scope.remoteItem);
		});
		$scope.editing = true;
	}
	// TODO - can we get rid of this?
	$scope.loadItem();
})
.controller('AuthenticateCtrl', function($scope, $location, Authenticate) {
	$scope.user = {};
	$scope.login = function(user) {
		Authenticate.login(user).$promise.then(function (user) {
			// this scope method is on the parent controller ApplicationCtrl
			$scope.setCurrentUser(user);
			$location.path('/items/');
		});
	};
	$scope.logout = function() {
		Authenticate.logout();
		$scope.setCurrentUser(null);
	}

})
;