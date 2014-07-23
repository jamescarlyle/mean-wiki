angular.module('wikiServices', [])
// service for Items
.service('RemoteStorage', function(Item, Message, $rootScope) {
	// the function is the constructor - return an map of function names and the function provided
	var store = function(resourceItem, raiseEvent) {
		// hold the previous updated timestamp, in case we need to revert to it in the event of failure
		var previousUpdate = resourceItem.serverUpdate;
		// set the server update time to be the same as the client last update
		resourceItem.serverUpdate = resourceItem.clientUpdate;
		// if _id exists, already saved on server, so PUT update, otherwise POST an insert
		(resourceItem._id? resourceItem.$update() : resourceItem.$save())
		.then(function() {
			Message.success('Item was saved remotely');
			// set client update to be same as server, so item shows as synchronised
			resourceItem.clientUpdate = resourceItem.serverUpdate;
			// raise an event for remote storage, so the remote time can be updated in local storage and syncStatus shows synchronised
			if (raiseEvent) { $rootScope.$emit('remoteStorageStored', resourceItem); };
		})
		.catch(function() { 
			Message.failure('Item was not saved remotely');
			// roll back the server update as update did not go through
			resourceItem.serverUpdate = previousUpdate;
		})
	};
	this.store = store;
	var remove = function(resourceItem) {
		resourceItem.$remove()
		.then(function() {
			Message.success('Item deleted successfully');
		})
		.catch(function() {
			Message.failure('Item was not deleted');
		})
	};
	this.remove = remove;
	// TODO - should RemoteStorage methods take Resources as parameter? Or _id?
	this.retrieveOne = function(_id) {
		// this returns a promise
		return Item.get({_id: _id});
	};
	this.retrieveModifiedSince = function(modifiedSince) {
		// this returns a promise
		return Item.queryModifiedSince(modifiedSince);
	};
	$rootScope.$on('localStorageStored', function(event, data) {
		// listen for local storage events and replicate remotely
		store(data, true);
	});	
	$rootScope.$on('localStorageRemoved', function(event, data) {
		// listen for local storage events and replicate remotely
		remove(data, true);
	});
})
.service('LocalStorage', function(Item, RemoteStorage, $rootScope) {
	// need to include RemoteStorage as a dependency, otherwise it won't get instantiated (not called directly except as event listener)
	var store = function(resourceItem, raiseEvent) {
		// serialise the passed object and store locally
		localStorage[resourceItem.name] = JSON.stringify({
			_id: resourceItem._id, 
			clientUpdate: resourceItem.clientUpdate,
			serverUpdate: resourceItem.serverUpdate,
			content: resourceItem.content
		});
		// now emit an event with the resourceItem as object
		if (raiseEvent) { $rootScope.$emit('localStorageStored', resourceItem); };
	};
	this.store = store;
	var remove = function(resourceItem, raiseEvent) {
		// serialise the passed object and store locally
		localStorage.removeItem(resourceItem.name);
		// now emit an event with the resourceItem as object
		if (raiseEvent) { $rootScope.$emit('localStorageRemoved', resourceItem); };
	};
	this.remove = remove;
	this.retrieve = function(itemName) {
		// deserialises and returns an item object - populated or empty
		var resourceItem = new Item();
		angular.extend(resourceItem, JSON.parse(localStorage[itemName] || '{}'));
		resourceItem.name = itemName;
		return resourceItem;
	};
	$rootScope.$on('remoteStorageStored', function(event, data) {
		// listen for local storage events and replicate remotely
		store(data, false);
	});	
})
;