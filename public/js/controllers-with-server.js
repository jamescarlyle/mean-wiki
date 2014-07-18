var wikiControllers = angular.module('wikiControllers', [])
.controller('ItemListCtrl', function ($scope, $rootScope, Item, LocalStorage) {
	// freshen local storage from server - will not overwrite items that have not yet been stored, i.e. additive only
	$scope.refreshItems = function() {
		var serverItems = Item.query(function() {
			var localItem, remoteItem;
			for (i = 0; i < serverItems.length; i++) {
				// arange items for comparison
				remoteItem = serverItems[i];
				localItem = LocalStorage.retrieve(remoteItem.name);
				// for the time being, simply update the remote update time on the local instance
				localItem.serverUpdate = remoteItem.serverUpdate;
				// if local = remote do nothing
				// if local is behind remote, someone else has updated remote, store new remote so warning can be shown
				// if local is ahead of remote, we have a local update not persisted
				// if (remoteItem.serverUpdate > localItem.serverUpdate) {
				// 	// updated elsewhere more recently - save remote update timestamp locally so warning can be displayed

				// } else {
				// 	// updated locally more recently - save 

				// }
				LocalStorage.store(localItem);
			}
		}, function() { 
		});
	};
	$scope.getItemByName = function (name) {
		return LocalStorage.retrieve(name);
	};
	// $scope.localStorageItems = [];
	$scope.items = [];
	var item = {};
	for (i = 0; i < localStorage.length; i++) {
		item = LocalStorage.retrieve(localStorage.key(i));
		$scope.items.push({name: item.name, syncStatus: getSyncStatus(item)});
	}
})
.controller('ItemDetailCtrl', function ($scope, $rootScope, $routeParams, RemoteStorage, LocalStorage) {
	$scope.loadItem = function() {
		// fetch the item content using the name from the URL fragment
		$scope.item = LocalStorage.retrieve($routeParams.name);
		// determine whether we should immediately go into edit mode, if the page does not exist
		$scope.editing = !$scope.item.content;
		// get the status of item
		$scope.syncStatus = getSyncStatus($scope.item);
		// clear message
		$rootScope.opStatus = '';
	};
	$scope.saveItem = function() {
		// save the edited wiki content to the server, and if successful, update local storage
		RemoteStorage.store($scope.item);
		// update the status of item 
		// TODO - this has a bug - should be calculated as the call back .then from the store call, as otherwise will be calculated before the local/server update times have been set
		$scope.syncStatus = getSyncStatus($scope.item);
	};
	$scope.removeItem = function() {
		// send a delete to the remote store
		RemoteStorage.remove($scope.item);
	}
	$scope.loadItem();
})
;
var getSyncStatus = function (item) {
	if (!item.clientUpdate) {
		return {status:'flash', message:'not saved'};
	} else if (item.serverUpdate > item.clientUpdate) {
		return {status:'save', message:'needs to be refreshed locally'};
	} else if (item.serverUpdate < item.clientUpdate) {
		return {status:'open', message:'needs to be saved remotely'};
	} else return {status:'saved', message:'synchronised'}; ;
};