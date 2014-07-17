var wikiControllers = angular.module('wikiControllers', [])
.controller('ItemCtrl', function($scope, LocalStorage) {
	$scope.getItemStatusByName = function (name) {
		var item = LocalStorage.retrieve(name);
		if (item.serverUpdate > item.clientUpdate) {
			return {status:'import', message:'the item needs to be refreshed locally'};
		} else if (item.serverUpdate < item.clientUpdate) {
			return {status:'export', message:'the item needs to be saved remotely'};
		} else return {status:'saved', message:'the item is synchronised'}; ;
	};
})
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
	$scope.localStorageItems = localStorage;
})
.controller('ItemDetailCtrl', function ($scope, $rootScope, $routeParams, RemoteStorage, LocalStorage) {
	$scope.loadItem = function() {
		// fetch the item content using the name from the URL fragment
		$scope.item = LocalStorage.retrieve($routeParams.name);
		// determine whether we should immediately go into edit mode, if the page does not exist
		$scope.editing = !$scope.item.content;
		// clear message
		$rootScope.opStatus = '';
	};
	$scope.saveItem = function() {
		// save the edited wiki content to the server, and if successful, update local storage
		RemoteStorage.store($scope.item);
	};
	$scope.removeItem = function() {
		// send a delete to the remote store
		RemoteStorage.remove($scope.item);
	}
	$scope.loadItem();
})
;