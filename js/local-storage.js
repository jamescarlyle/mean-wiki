angular.module('localStorage', ['remoteStorage', 'resources'])
.service('LocalStorage', ['Item', 'Message', 'RemoteStorage', '$rootScope', function(Item, Message, RemoteStorage, $rootScope) {
	var store = function(resourceItem, applyRemotely) {
		// now the clientupdate is set in the calling function - depends on whether a user-initiated save, or a server refresh/sync
		// was previously resourceItem.clientUpdate = (resourceItem.clientUpdate == null && resourceItem.serverUpdate != null) ? resourceItem.serverUpdate : Date.now();
		// try and save remotely
		if (applyRemotely) {
			// if online and logged in, save first to server, and then callback to update locally
			RemoteStorage.store(resourceItem, this.updateLocalStorage);
		} else {
			this.updateLocalStorage(resourceItem);
		}
	};
	this.store = store;
	var updateLocalStorage = function(resourceItem) {
		// serialise the passed object and store locally
		localStorage[resourceItem.name] = resourceItem.asString;
		// if offline, alert that item was saved locally (online saved message will come from RemoteStorage)
		// if (!$rootScope.online) {
			Message.success('Item was saved locally'); 
		// };
	};
	this.updateLocalStorage = updateLocalStorage;
	var remove = function(resourceItem, applyRemotely) {
		// serialise the passed object and store locally
		localStorage.removeItem(resourceItem.name);
		// TODO remove remotely
	};
	this.remove = remove;
	var retrieveByName = function(itemName) {
		// deserialises and returns an item object - populated or empty
		var resourceItem = new Item();
		resourceItem.name = itemName;
		// need to use getItem to return null instead of undefined if not exists
		angular.extend(resourceItem, JSON.parse(localStorage.getItem(itemName) || '{}'));
		return resourceItem;
	};
	this.retrieveByName = retrieveByName;
	this.retrieveBySchema = function(schema, itemName) {
		return this.retrieveByName((schema == 'items' ? '#' : '@') + itemName);
	};
	this.retrieveAll = function() {
		var items = [];
		var regExp = /([#\@])(\w+)/;
		var match, key;
		for (i = 0; i < localStorage.length; i++) {
			key = localStorage.key(i);
			match = regExp.exec(key);
			if (match) {
				var item = JSON.parse(localStorage[key] || '{}');
				items.push({fullName: match[1] + match[2], schema: {'#':'items','@':'people'}[match[1]], name: match[2], syncStatus: Item.getSyncStatus(item.clientUpdate, item.serverUpdate)});
			}
		}
		return items;
	};
	// $rootScope.$on('remoteStorageStored', function(event, data) {
	// 	// listen for remote storage events and update so that remote update time stored locally
	// 	store(data, false);
	// });	
}])
;