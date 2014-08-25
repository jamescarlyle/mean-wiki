var controllers = angular.module('controllers', ['localStorage', 'remoteStorage', 'userMessage', 'comparison'])
// .controller('ItemListCtrl', function ($scope, $rootScope, Configuration, RemoteStorage, LocalStorage) {
	// freshen local storage from server - will not overwrite items that have not yet been stored, i.e. additive only
	// $scope.refreshItems = function() {
	// 	var lastCheck = Configuration.getModifiedSince();
	// 	// this is set before the fetch, because otherwise there is a small gap between the fetch and now that will not be picked up next time
	// 	Configuration.setModifiedSince(Date.now());
	// 	RemoteStorage.retrieveModifiedSince(lastCheck).$promise.then(function(serverItems) {
	// 		var localItem, remoteItem;
	// 		for (i = 0; i < serverItems.length; i++) {
	// 			// arange items for comparison
	// 			remoteItem = serverItems[i];
	// 			localItem = LocalStorage.retrieve(remoteItem.name);
	// 			// if local remote is same as remote, and local is ahead of remote, we have a local update not persisted
	// 			if (localItem.serverUpdate == remoteItem.serverUpdate && localItem.clientUpdate > localItem.serverUpdate) {
	// 				// signal recent local save, will trigger remote save
	// 				$rootScope.$emit('localStorageStored', localItem);
	// 			} else if (localItem.serverUpdate != remoteItem.serverUpdate) {
	// 				// for the time being, simply update the remote update time on the local instance
	// 				localItem.serverUpdate = remoteItem.serverUpdate;
	// 				// and store locally
	// 				LocalStorage.store(localItem, false);
	// 			}
	// 		}
	// 	});
	// };
	// $scope.getItemByName = function (name) {
	// 	return LocalStorage.retrieve(name);
	// };
	// set up initial list of items
	// $scope.items = [];
	// var item = {};
	// for (i = 0; i < localStorage.length; i++) {
	// 	var key = localStorage.key(i);
	// 	if (key.match(/([#\@])(\w+)/)) {
	// 		item = LocalStorage.retrieve(key);
	// 		$scope.items.push({name: item.name, syncStatus: item.syncStatus()});
	// 	}
	// }
// })
.controller('ItemDetailCtrl', function ($scope, $rootScope, $routeParams, $location, LocalStorage, RemoteStorage, Comparison) {
	$scope.loadItem = function() {
		// fetch the item content using the name from the URL fragment
		$scope.item = LocalStorage.retrieve($routeParams.schema, $routeParams.name);
		// determine whether we should immediately go into edit mode, if the page does not exist
		$scope.editing = !$scope.item.content && !$scope.item.notes;
		// clear message
		$rootScope.opStatus = '';
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
		RemoteStorage.retrieveOne($scope.item._id).$promise.then(function(item) {
			$scope.remoteItem = item;
			$scope.comparison = Comparison.compare($scope.item, $scope.remoteItem);
		});
		$scope.editing = true;
	}
	$scope.loadItem();
})
;